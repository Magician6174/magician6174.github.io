---
title: "Action Chunking Transformer for Robotic Pick-and-Place"
excerpt: "A 51.6M-parameter CVAE + transformer imitation-learning policy, implemented from scratch, that learns 7-DOF pick-and-place from RGBD teleoperation demonstrations."
tier: flagship
order: 1
date: 2026-07-02
tags:
  - Imitation Learning
  - Transformers
  - PyTorch
  - MuJoCo
# Drop a rollout GIF at assets/images/act-rollout.gif and uncomment to add a card thumbnail
# header:
#   teaser: /assets/images/act-rollout.gif
# Code release pending
# links:
#   - url: https://github.com/magician6174/panda-act
#     label: "Source"
toc: true
toc_sticky: true
---

## Overview

An end-to-end **behaviour-cloning system** that teaches a Franka Emika Panda (7-DOF) to
pick an object off a table and place it into a bin, learning purely from human
teleoperation demonstrations. The policy is an **Action Chunking Transformer (ACT)** —
a conditional VAE with a transformer encoder-decoder that predicts *chunks* of future
actions rather than one step at a time.

The entire policy was **implemented from scratch in PyTorch**. Only the dataset plumbing
(LeRobot v3.0) was reused; the CVAE, the transformer stack, the vision backbone, the
normalisation, and the temporal-ensembling controller were all re-derived from the paper.

## The pipeline

**1. Simulation environment.** MuJoCo scene with a Panda arm, a randomised graspable
object, and a placement bin. Shape variety is generated at the *model* level by rebuilding
the compiled model per episode through `MjSpec` (box / cylinder / sphere, 2–4 cm), while
pose and orientation are randomised at the *state* level. Object and bin placements are
reject-sampled so both are collision-free and visible to at least one camera — cameras are
the policy's only exteroceptive input, so an invisible object is an unlearnable episode.

**2. Teleoperation and data collection.** Two operator interfaces feed the same inverse
kinematics solver: a keyboard Cartesian-jog viewer and a **PS5 DualSense velocity
controller** (stick deflection maps to end-effector velocity, integrated into a target
pose each frame). A recording state machine captures 30 fps episodes with explicit
success / cancel / finish transitions and per-episode checkpointing, so a crash never
costs more than the take in progress.

Final dataset: **200 episodes, ~49k frames**, three camera streams (front, diagonal,
wrist-mounted eye-in-hand) plus proprioception.

**3. Observation and action spaces.**

| Space | Definition |
|---|---|
| Observation | 3 × RGBD camera streams (480×640) + 8-D proprioception (7 joint angles + finger width) |
| Action | 8-D absolute position-servo targets (7 joint angles + gripper aperture) |

Absolute joint-position targets are the natural action space for chunked prediction:
a chunk is a short trajectory, not a fragile sequence of deltas.

**4. The policy network.** Four components:

- **Shared ResNet-18 backbone** across all three cameras, with frozen BatchNorm, a 1×1
  projection to a 512-D token space, and 2-D sinusoidal position embeddings.
- **CVAE style encoder** (training only): a transformer over `[CLS] + state + action chunk`
  producing a 32-D latent that absorbs demonstrator style variation. Set to zero at
  inference, which is what makes the policy deterministic at test time.
- **Transformer encoder** (4 layers) over the latent, the state token, and ~900 image
  patch tokens.
- **Transformer decoder** (1 layer) where `chunk_size` learned query slots cross-attend
  into that memory and a linear head emits a `(chunk_size, 8)` action trajectory.

Loss is masked L1 on the chunk plus a KL term. DETR-style position embeddings are
re-added at every attention layer (queries and keys only, values stay position-free).

**Model size: 51.6M trainable parameters.** Chunk size 100 (~3.3 s at 30 fps).

**5. Training and evaluation.** Trained on an AWS SageMaker G6 instance (NVIDIA L4) with
AMP, dataset synced to local EBS — never streamed from S3, since random-access video
decode is far too slow for a dataloader. Closed-loop rollouts run back on the laptop
through the same MuJoCo scene generator, with online **temporal ensembling** (exponentially
weighted average over overlapping chunk predictions) smoothing the executed trajectory.

## Results

**~60% closed-loop success rate** over randomised rollouts. More interesting than the
number was the failure taxonomy, which turned into the most valuable part of the project.

### Failure analysis

**Phantom grasp.** The gripper closes on empty space slightly offset from the object, then
confidently marches to the bin holding nothing. This is textbook **covariate shift**, not
an architecture problem. Re-querying the policy every frame does not rescue it, because
every fresh query lands in a state distribution the policy has never seen: the
demonstrations were success-only, so "empty gripper at an offset" simply does not exist in
the training data, and the gripper close is *phase*-triggered rather than contact-verified.
The fix is failure-recovery demonstrations, not a bigger network.

**Grasp offset on flat-faced objects.** Spheres and cylinders grasp reliably; the cube
fails. ResNet-18 `layer4` on a 480×640 input yields a 15×20 feature grid — roughly 32 px
per patch, too coarse for the millimetre-accurate localisation a flat-faced grasp needs.
Rotationally symmetric objects forgive the error; a cube does not.

**Wrist misalignment.** The scene generator only randomised yaw about the world Z axis, so
there were zero tilted-face examples — tilt alignment is *unlearnable* from this dataset.
Yaw alignment is in-distribution, but the L1 objective combined with a strong KL weight
regresses toward a canonical wrist pose instead of committing to one of the two
π-symmetric jaw alignments.

### The chunk-size result

Reducing `chunk_size` from 100 to 20 made rollouts **worse**, which is initially
counter-intuitive. Chunking is the mechanism that *prevents* compounding error, not the
cause of perceptual blindness. At 30 fps, a 20-step chunk is about 0.67 s — shorter than
the reach-to-grasp motion itself — so the policy loses temporal consistency and gains no
perceptual acuity in exchange. Because `chunk_size` is baked into the decoder and VAE
position embeddings, this was a full retrain, making it a clean two-policy comparison.

## Depth (RGBD) upgrade

Depth was already being rendered for debugging but never fed to the policy. Adding it was
the cheapest available fix for the localisation bottleneck:

- Depth quantised to `uint8` over a 0.05–2.05 m range (~7.8 mm per level) and stored as an
  additional video stream per camera.
- ResNet-18 `conv1` expanded from 3 to 4 input channels, with the depth kernel warm-started
  as the mean of the RGB kernels rather than randomly initialised.
- The rollout path mirrors the exact training-time quantisation so normalisation statistics
  line up between train and test.

Verified end to end: metric depth on all three cameras, six video streams round-tripping
through the recorder, forward and backward passes clean.

## Simulation groundwork

Before any learning was possible, the simulated grasp had to actually hold and the operator
had to be able to demonstrate the task comfortably. That involved damped-least-squares IK
with null-space regularisation, a hand-written GLFW viewer with RGBD camera capture, PS5
gamepad teleoperation, and a contact-physics debugging effort that took maximum stable wrist
roll from 7 degrees to roughly 75. All of it is written up separately in
[7-DOF Teleoperation, Inverse Kinematics and Contact Physics](/projects/panda-teleop-ik/).

## Takeaways

- Chunked action prediction is an anti-compounding-error mechanism; shortening the horizon
  below the natural motion length trades away its main benefit.
- Success-only demonstrations produce policies with no recovery behaviour. Covariate shift
  is a *data* problem, and closed-loop re-querying does not fix it.
- Randomisation must cover the axes you expect the policy to handle. Yaw-only
  randomisation makes tilt alignment mathematically unlearnable, regardless of capacity.
- Diagnose before tuning. Both the grasp-slip and out-of-memory problems had root causes
  that contradicted the obvious first hypothesis.
