---
title: "Diffusion Policy from Scratch for Robotic Manipulation"
excerpt: "A 79.9M-parameter conditional denoising diffusion policy — DDPM/DDIM, a 1D temporal U-Net with FiLM conditioning, and a SpatialSoftmax vision encoder — built from the paper and benchmarked head-to-head against ACT."
tier: flagship
order: 2
date: 2026-07-16
tags:
  - Diffusion Models
  - Generative AI
  - PyTorch
  - MuJoCo
# Drop a rollout GIF at assets/images/diffusion-rollout.gif and uncomment to add a card thumbnail
# header:
#   teaser: /assets/images/diffusion-rollout.gif
# Code release pending
# links:
#   - url: https://github.com/magician6174/panda-diffusion-policy
#     label: "Source"
toc: true
toc_sticky: true
---

## Overview

A from-scratch implementation of **Diffusion Policy** (Chi et al., 2023) for the same
Panda 7-DOF pick-and-place task used in my [ACT project](/projects/act-panda-pick-place/),
built specifically so the two approaches could be compared on identical data.

Instead of regressing an action sequence directly, the policy is reframed as a
**conditional denoising diffusion model over action trajectories**: sample a candidate
action horizon from Gaussian noise, then iteratively denoise it conditioned on the
observation. This lets the policy represent genuinely *multimodal* action distributions —
several different valid ways to reach the same object — where a regression objective would
average them into a single invalid trajectory.

No `diffusers`, no library policy implementation. The DDPM scheduler, the timestep
embeddings, the FiLM conditioning, the temporal U-Net, and the vision encoder were all
written from the paper. **79.9M trainable parameters.**

## Architecture

**Vision encoder.** ResNet-18 with every BatchNorm swapped for **GroupNorm** (batch
statistics are unreliable when the effective batch is `batch × obs_steps × cameras`),
followed by **SpatialSoftmax** pooling. SpatialSoftmax converts each feature channel into a
2-D expected keypoint location rather than a global average, which preserves *where* things
are — exactly the signal a manipulation policy needs.

**Denoising network.** A **1-D temporal U-Net** over the action-horizon axis:
`Conv1d + GroupNorm + Mish` blocks in an encoder / middle / decoder stack with skip
connections. Conditioning enters through **FiLM** (feature-wise linear modulation): the
concatenated observation embedding and diffusion-timestep embedding produce per-channel
scale and shift parameters applied inside each residual block. This keeps conditioning
multiplicative and resolution-independent rather than concatenating a context vector once
at the input.

**Noise scheduler.** Cosine beta schedule, epsilon-prediction parameterisation. **DDPM** for
training, **DDIM** with 10 inference steps for rollout — the deterministic DDIM sampler is
what makes diffusion viable at control rates.

**Weight averaging.** An EMA copy of the network is maintained throughout training and used
for all evaluation, which is standard for diffusion models and made a material difference.

**Control scheme.** Receding horizon: condition on the last 2 observations, predict a
16-step action trajectory, execute 8 steps, then replan. This contrasts sharply with ACT's
single observation → 100-step chunk → per-frame temporal ensembling.

## Engineering problems worth recording

**CUDA out-of-memory, and the real cause.** Training OOM'd at batch size 32 inside the
ResNet GroupNorm. The instinct is to lower the batch size; the actual issue was that full
480×640 images were being fed in with **no resize at all**. Memory scales with
*images per step* = `batch × obs_steps(2) × cameras(3)` = 192 full-resolution images per
step — and SpatialSoftmax discards fine pixel detail anyway. Adding a `resize_hw` flag
defaulting to 240×320 quartered activation memory. For reference, the original paper uses
96×96, so 240×320 remains conservative.

**Shared-memory exhaustion, which looked identical to OOM.** With the GPU fixed, training
then died with a `/dev/shm` allocation failure in the dataloader collate. Cause: the resize
lived *inside the model*, on the GPU, so worker processes were still shipping native
480×640 tensors through shared memory — roughly 1.7 GB per batch. The tempting fix
(`set_sharing_strategy("file_system")`) is wrong twice over: it still routes through
`/dev/shm` via `shm_open`, and it leaks shared-memory segments when a process is SIGKILLed.
The real fix was moving the resize into the **dataset transform**, so only 240×320 tensors
cross the process boundary.

The resize now deliberately exists in two places: in the dataset for the training path, and
guarded inside the model for the rollout path, where frames arrive at native resolution
straight from the renderer with no dataloader in between.

**Feature-map dimension bug.** Computing the backbone output grid as `resize_hw // 32` is
wrong, because ResNet rounds *up* at pooling layers — 240 gives height 8, not 7. Replaced
the arithmetic with a dummy-tensor probe that reads the true shape from the backbone.

**A silent EMA checkpoint bug.** Mid-training checkpoints were saving *training* weights
instead of EMA weights. The mechanism is subtle and worth spelling out: `state_dict()`
returns tensor **references**, `ema.copy_to()` fills those tensors, then restoring the
training weights in place (shared storage) overwrites them *before* `torch.save` runs — so
the save read training weights. Fixed by cloning the save state before the restore.
Notably the final checkpoint was never affected, since nothing restores after it.

**A library-based contrast implementation.** After the from-scratch version worked, I wrote
`model_lib.py` — the same API backed by `diffusers` (`DDPMScheduler`, `DDIMScheduler`,
`Timesteps`, `EMAModel`). The instructive result: only the *noise mathematics*, timestep
embeddings, and EMA have clean library replacements. **SpatialSoftmax and the FiLM U-Net
body had to stay custom** — no library ships them in a usable form. Roughly the same
parameter count (79.8M vs 79.9M) at a third of the line count, but the parts that actually
encode the design decisions are the parts you still write yourself.

## Results

Trained to convergence: **100,000 steps** on an AWS SageMaker G6 instance, final train MSE
0.0014, best validation loss 0.0123.

**Rollout success: 25%**, against roughly **60% for ACT** on the same data.

That result is the most interesting thing the project produced, so it deserves a real
explanation rather than a shrug.

### Why the more expressive model lost

**Replan discontinuities.** Every replan starts from *fresh* noise, so DDIM can land in a
different mode than the previous plan chose. Because actions are absolute joint targets,
that shows up as visible snapping at plan boundaries. This is inherent to naive receding
horizon, not a bug.

**Gripper mode-averaging.** The gripper channel is effectively near-discrete
(open / closed), and diffusion's mode-covering behaviour regressed it toward a mid-range
value — producing hovering and reluctance to release.

**Shared covariate shift.** The same phantom-grasp failure as ACT, from the same cause:
success-only demonstrations, no recovery behaviour anywhere in the dataset.

**Perception, again.** Spheres grasp well; asymmetric objects struggle. The 240×320 resize
halved the SpatialSoftmax grid from 15×20 to 8×10, which is marginal for edge localisation.

### The conclusion

Diffusion Policy wins when **action multimodality is the bottleneck**. It loses when the
bottleneck is **perception or data coverage**, and it pays for expressiveness in inference
cost and trajectory smoothness.

This task turned out to be data-coverage-limited — precise object localisation plus missing
recovery demonstrations — so ACT's per-frame temporal ensembling won, and Diffusion
Policy's fresh-noise replanning jerk was a pure cost with no offsetting benefit. The
expected ordering should reverse once recovery and multi-approach demonstrations are added
and the gripper release signal is handled properly.

**Practical decision rule:** if the task has genuinely multiple valid strategies and that
matters, reach for Diffusion Policy. If you are compute-constrained, running at high
control rates, or the behaviour is essentially unimodal, ACT is the better trade.

## In progress

**Temporal ensembling for the diffusion policy** (designed, not yet implemented). With
`horizon=16` and `n_action_steps=8`, the 7 leftover predicted steps overlap the next plan's
head and can be averaged to bridge the seam. Three caveats fall out of the analysis:

1. **Do not ensemble the gripper channel** — that makes the smeared-release problem worse.
   Average the 7 arm joints only and take the gripper from the newest plan.
2. It partially re-imports mode-averaging if adjacent plans disagree, which is acceptable
   here only because the behaviour is close to unimodal.
3. `n_action_steps` is the smoothness-versus-compute dial: 8 gives a 2-way blend, 1 gives
   full ACT-style ensembling at 8× the denoising cost.

This is a rollout-only change requiring no retraining.
