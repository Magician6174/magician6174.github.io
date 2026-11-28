---
title: "RNN Solver for Velocity-Constrained KUKA iiwa Motion"
excerpt: "Used a recurrent neural solver for time-varying inverse kinematics with joint-velocity bounds on a KUKA iiwa, using Python and ROS1."
tier: flagship
order: 7
category: "Motion planning and control"
tags:
  - Python
  - ROS1
  - Inverse Kinematics
---

## Control problem

The seven-joint KUKA iiwa has more joint variables than a six-dimensional end-effector motion task. At each configuration, the Jacobian relates joint velocities to the requested end-effector velocity. The kinematic equations are underdetermined, and the robot's joint-velocity limits restrict which solutions are feasible.

## Approach

I reformulated the time-varying, bound-constrained linear system as a system of equations and used a recurrent neural network to solve it as the kinematics changed. I applied the solver in Python and ROS1 to generate joint velocities for the iiwa while accounting for the limits in the formulation.

## Reference

[IEEE paper on the recurrent neural solver for bound-constrained, time-dependent linear systems](https://ieeexplore.ieee.org/document/8435986).
