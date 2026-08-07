---
title: "QP Differential IK for an Under-Actuated 5-DOF Arm"
excerpt: "Teleoperation of the SO-101 low-cost arm, where 5 degrees of freedom cannot satisfy a full 6-D pose — solved with quadratic-programming differential IK and a hard-position / soft-orientation constraint split."
tier: flagship
order: 4
date: 2026-06-12
tags:
  - Inverse Kinematics
  - Optimization
  - Teleoperation
  - MuJoCo
# header:
#   teaser: /assets/images/so101-teleop.gif
# Code release pending
toc: true
toc_sticky: true
---

## Overview

Simulation and teleoperation of the **SO-101**, a low-cost open-source 5-DOF arm with a
gripper, in MuJoCo. This was my entry point back into hands-on robotics, and it turned out
to be a better teaching problem than a 7-DOF arm precisely *because* it is under-actuated:
you cannot hide from the kinematics.

## The core problem: 5 DOF, 6-D task space

A rigid-body pose has six degrees of freedom (three translation, three rotation). The SO-101
has five actuated joints. **Some target poses are simply unreachable**, not because of joint
limits or obstacles, but as a matter of rank. Any usable IK formulation has to decide what to
sacrifice, and decide it consistently.

My first attempt was a hand-rolled Jacobian pseudo-inverse with a null-space term. It solved
static targets acceptably but was **unstable under teleoperation** — near rank-deficient
configurations it would snap to a distant solution branch mid-motion, which is unusable when
a human is in the loop.

## Solution: QP differential IK with a constraint hierarchy

I moved to **`placo`**, a quadratic-programming differential IK solver (the same solver
LeRobot uses), which allows the problem to be expressed as an explicit hierarchy rather than
a single least-squares blend:

- **Position: a hard constraint.** The end-effector reaches the commanded point, always.
- **Orientation: a soft, weighted objective.** Best effort, sacrificed when the two conflict.
- **Velocity limits: per-solve constraints** matched to the control period, which is what
  actually eliminated the branch-snapping. Limiting how far the solution may move per
  timestep enforces continuity structurally instead of hoping a warm start is enough.
- **Graceful degradation:** if the QP is infeasible, fall back to re-solving position-only
  rather than returning garbage.

A useful detail: the URDF frame used by the solver coincides exactly with the MuJoCo site
used for measurement, so solutions feed straight into the position-servo targets with no
correction transform — a small alignment decision that removes an entire class of
frame-mismatch bugs.

Teleoperation runs at a low iteration count with velocity limiting enabled (smoothness
matters more than convergence per frame); one-shot analytic tests run with a high iteration
count and no velocity limit.

## Measuring what the arm can actually do

The most instructive part was quantifying the under-actuation instead of arguing about it.
I measured position drift while commanding each rotation axis independently while holding
position:

| Commanded rotation | Position drift |
|---|---|
| Roll about tool Z (wrist twist) | **0.46 mm** over 73° |
| Yaw about tool X | 1.2 mm over 16° |
| Pitch about tool Y | ~45 mm |

The conclusion is unambiguous: **wrist twist about the tool axis is the one rotation this arm
can perform freely while holding position.** The other two axes trade position accuracy for
orientation, because there is no spare degree of freedom to pay with.

So I **remapped the teleoperation controls around the hardware's actual capability** rather
than exposing three nominal rotation axes with wildly different and undocumented behaviour.
The free axis got the primary control; the compromised axes remain available but are known
and documented as lossy. Making the operator interface honest about the mechanism is a better
outcome than papering over it in software.

## Custom teleoperation viewer

A hand-written GLFW window (mouse orbit / pan / zoom) with joint-space and Cartesian control
modes:

- Number keys select a joint, arrow keys jog it, Tab cycles selection.
- **Hold-to-move via per-frame key-state polling**, not discrete key events, so motion is
  continuous rather than stuttering at the OS key-repeat rate.
- **Frame-rate-independent** motion (`rate × dt`), so behaviour does not change with render
  load.
- Edge detection on selection keys so one press equals one step.

Small things, but they are the difference between a demo and something you can comfortably
drive for an hour.

## Takeaways

- Choose the right solver class. A QP with explicit constraint priorities and velocity limits
  is not just a nicer API than pseudo-inverse plus null-space heuristics — it makes
  continuity a property of the formulation instead of something you tune toward.
- Under-actuation is a specification, not a bug. The productive move was measuring exactly
  which capability the mechanism has and designing the interface around it.
- Frame conventions are worth aligning deliberately at setup time. Making the solver frame
  and the measurement site identical eliminated a whole category of debugging.
