---
title: "PILCO for a Planar 2R Manipulator"
excerpt: "A MATLAB project using Gaussian-process dynamics and analytic policy gradients to learn joint torques for a two-joint robot arm."
tier: flagship
order: 6
category: "Model-based reinforcement learning"
tags:
  - MATLAB
  - Gaussian Processes
  - Policy Search
---

## Control task

I used **PILCO (Probabilistic Inference for Learning Control)** in MATLAB to learn a torque control policy for a planar 2R manipulator, a robot arm with two revolute joints. The policy maps the arm's state to torques at the two joints.

## Dynamics and policy search

- **Learned probabilistic dynamics.** A Gaussian process models how the arm's state changes under applied torques and quantifies uncertainty in those predictions.
- **Evaluated the policy under uncertainty.** Deterministic approximate inference propagates predicted state distributions over the planning horizon to estimate the policy's expected cost.
- **Updated the torque policy using analytic gradients.** Differentiating the approximate expected cost with respect to the policy parameters provides the gradient used in policy search.

## Reference

Deisenroth and Rasmussen, [PILCO: A Model-Based and Data-Efficient Approach to Policy Search](https://icml.cc/2011/papers/323_icmlpaper.pdf), ICML 2011.
