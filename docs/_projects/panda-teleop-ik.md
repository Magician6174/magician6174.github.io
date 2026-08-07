---
title: "7-DOF Teleoperation, Inverse Kinematics and Contact Physics"
excerpt: "A custom simulation stack for the Franka Emika Panda: damped-least-squares IK with null-space regularisation, a hand-written GLFW viewer with RGBD cameras, PS5 gamepad teleoperation, and the contact-physics debugging that made grasping work."
tier: flagship
order: 3
date: 2026-06-25
tags:
  - Inverse Kinematics
  - Teleoperation
  - MuJoCo
  - OpenGL
# header:
#   teaser: /assets/images/panda-teleop.gif
# Code release pending
toc: true
toc_sticky: true
---

## Overview

The simulation and control layer underneath my
[ACT](/projects/act-panda-pick-place/) and
[Diffusion Policy](/projects/diffusion-policy-panda/) work. Before any policy can be
learned, a human has to be able to demonstrate the task comfortably and the simulated
grasp has to actually hold — both of which turned out to be real engineering problems.

Built on MuJoCo with a Franka Emika Panda (7 position-servo joints plus a tendon-driven
gripper).

## Inverse kinematics

**Damped least squares** on the analytic Jacobian of the gripper site, with a **null-space
posture term** that pulls redundant joint configurations back toward a nominal home pose.
For a 7-DOF arm solving a 6-D task there is a one-dimensional null space, and without that
regularisation the elbow drifts into awkward or near-singular configurations over a long
teleoperation session.

Details that mattered in practice:

- **Orientation error as a world-frame rotation vector** derived from
  `R_target · R_currentᵀ`, rather than naive Euler-angle differences, which wrap badly.
- **Warm-starting** each solve from the current joint configuration, so the solver tracks
  continuously instead of jumping between IK branches.
- **Per-iteration step clamping** (`max_dq`), which is what keeps teleoperation smooth and
  prevents the arm from snapping across the workspace when a target becomes briefly
  unreachable.

## Custom GLFW viewer

MuJoCo ships a viewer, but on macOS it requires a special interpreter entry point and does
not compose with a custom render loop, so I wrote my own GLFW window: mouse orbit / pan /
zoom, frame-rate-independent hold-to-move joint jogging (polling key state each frame
rather than consuming discrete events), and a Cartesian jog mode driving the IK solver.

**A macOS OpenGL trap worth documenting.** `mjr_drawPixels` is a **silent no-op** on Apple
Silicon — the Metal-backed OpenGL 2.1 driver does not implement `glDrawPixels`, and it fails
without any error, so a picture-in-picture camera overlay simply renders nothing while every
call appears to succeed. The fix is to blit through a fixed-function textured quad
(`glGenTextures` / `glTexImage2D` / `GL_QUADS`).

**Camera and depth tooling.** Three cameras (front, diagonal, and a wrist-mounted
eye-in-hand view), a cycling picture-in-picture overlay, RGB and metric-depth modes with a
percentile-based auto-ranged colour map, and toggleable coordinate frame axes. This is the
same render path the learning pipeline uses to capture observations, so what the operator
sees is exactly what the policy gets.

**Grip-force HUD.** A vertical bar summing contact normal forces across the fingertip pads,
with a tick mark at the object's weight — which made the grasp-tuning work below far easier
to reason about than staring at printed numbers.

## PS5 DualSense teleoperation

A second operator interface, deliberately chosen as a stepping stone before VR (no WebRTC,
no self-signed certificates, no macOS main-thread render blocking).

It is **velocity control, not pose mirroring**: stick and trigger deflection map to
end-effector linear and angular velocity, integrated into a target pose each frame, then
handed to the same IK solver. Left stick drives X/Y, the analog triggers drive Z
proportionally, the right stick and shoulder buttons handle rotation, and face buttons
control the gripper and reset. Recording controls are mapped to the D-pad so an entire
data-collection session runs without touching the keyboard.

Implementation notes: the gamepad library must run with a dummy video driver so it does not
try to open its own window while GLFW owns the display, and controller axis indices vary by
operating system and by USB-versus-Bluetooth connection, so the build includes a **probe
mode** that prints live axis and button indices rather than hard-coding a mapping that
silently breaks.

## Contact physics: a debugging case study

This is the part I would most want to talk through in an interview, because the obvious
hypothesis was wrong twice.

**Symptom.** A grasped cube would slip out of the fingers at roughly 14° of wrist roll.

**Wrong hypothesis: insufficient friction or grip force.** Instrumenting the contact showed
normal force holding *constant* at ~2.5 N right up to a sudden release. A friction-limited
slip degrades progressively; a constant force followed by an abrupt pop is **geometric
roll-out** — the cube is literally rolling off the edge of flat 17 mm fingertip pads.

**The fix.** Enable **rolling friction** on the fingertip pad geometries, which requires
6-dimensional contact (`condim=6`) so the third friction coefficient is active, plus geom
`priority` so only the grip contact upgrades while cube-to-floor contact stays at the
cheaper, more stable default. Maximum *fully stable* roll (no perceptible in-grip shift, a stricter threshold than the 14° slip-out above) went from **7° to roughly 75°**, and yaw
improved comparably.

**Second wrong hypothesis: grip harder.** Residual in-grip shifting during rotation
remained. Tripling grip force from 7 N to 22 N moved the shift from 4.47 mm to 4.23 mm —
essentially nothing. The cause was **contact compliance**, not force: stiffening the pad
contact time constant (`solref`) cut the shift to **0.31 mm**. An elliptic friction cone
with a high impulse ratio then eliminated slow creep entirely.

**Knowing when to stop.** One residual axis stayed at ~11 mm and was completely independent
of force, friction, and speed. That signature means geometry: ~8.5 mm contact pads simply
cannot stop a 50 mm cube from rocking on its contact patches. Correctly diagnosed as
unfixable by tuning — the real options are a smaller object or larger pads.

**A related timing bug.** The gripper is a position servo, and separately I found the whole
simulation was running at roughly one-eighth of real speed because the stepping loop
assumed a fixed frame time. Replacing it with a self-timing accumulator (measure actual
wall-clock frame duration, clamp it, run the correct number of substeps) made the arm move
at its true commanded velocity for the first time — which changed demonstration quality
substantially, since the operator had unknowingly been teleoperating in slow motion.

## Domain randomisation for data collection

To widen the distribution of states the learned policies see, episodes randomise:

- **Object shape at the model level** — box, cylinder or sphere, rebuilt through MuJoCo's
  `MjSpec` API and recompiled per episode so mass, inertia and collision bounds are all
  correct, rather than being faked by rescaling one geometry.
- **Object and bin pose at the state level**, reject-sampled so nothing overlaps and both
  are inside the camera frustum.
- **Bounded start-pose jitter** (±0.15–0.25 rad per joint) and randomised initial gripper
  aperture.

One honest negative result: I had hoped start-pose randomisation would help with the
phantom-grasp failure mode. It does not, and reasoning about why was more useful than the
change itself — all demonstrations still start from a near-identical pose, so jitter only
widens the *reaching* basin of attraction, while phantom grasp is a mid-trajectory recovery
problem. Shipped it as a legitimate coverage improvement, but correctly labelled as not the
fix for that bug.

A prototyped **occlusion guard** was deleted after measurement showed it never fired once
across 200 episodes, even at six times the jitter — the scene geometry makes camera
occlusion by the arm effectively impossible. Removing 40 lines of dead code that *looked*
important was the right outcome. The **collision guard** was kept, since it fires around 1%
of the time and genuinely protects physical validity.
