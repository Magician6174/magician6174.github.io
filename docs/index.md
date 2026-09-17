---
layout: single
author_profile: true
title: false
---

## Himanshu Sharma

**Applied Scientist at Amazon Ads. Robotics, perception and robot learning.**

I build systems that learn to act — manipulation policies, the simulation and teleoperation
infrastructure they train on, and the perception stacks underneath. By day I work on
large-scale multimodal models for content understanding; the rest of the time I am usually
implementing a robot learning paper from scratch to find out what it does not tell you.

This site is where I write that work down properly, including the parts that did not work.

### Featured

- **[Action Chunking Transformer for Robotic Pick-and-Place]({{ '/projects/act-panda-pick-place/' | relative_url }})**
  A 51.6M-parameter CVAE and transformer imitation-learning policy, built from the paper.
  Reached ~60% closed-loop success — and the failure taxonomy taught me more than the number.

- **[Diffusion Policy from Scratch]({{ '/projects/diffusion-policy-panda/' | relative_url }})**
  A 79.9M-parameter denoising diffusion policy, benchmarked head-to-head against ACT on
  identical data. The more expressive model lost, and understanding why is the whole point.

- **[7-DOF Teleoperation, IK and Contact Physics]({{ '/projects/panda-teleop-ik/' | relative_url }})**
  Damped-least-squares inverse kinematics, a hand-written OpenGL viewer, gamepad
  teleoperation, and the contact-physics debugging that took stable grasp roll from 7° to 75°.

- **[Vision-Based Teleoperation of a KUKA IIWA]({{ '/projects/kuka-vision-teleoperation/' | relative_url }})**
  M.Tech research at IISc: real-time industrial-arm teleoperation from a single depth camera,
  with no motion-capture hardware.

### Explore

[All projects →]({{ '/projects/' | relative_url }}) · [Learning & courses →]({{ '/learnings/' | relative_url }}) · [About →]({{ '/about/' | relative_url }}) · [🤖 Robotics Resume (PDF)]({{ '/assets/Robotics_Resume-12826.pdf' | relative_url }})
