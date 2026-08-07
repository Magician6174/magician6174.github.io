---
title: "Vision-Based Teleoperation of a KUKA IIWA Industrial Arm"
excerpt: "M.Tech research at IISc Bengaluru: real-time teleoperation of an industrial manipulator that imitates a human operator's natural motion from a single depth camera, with no motion-capture rig or wearable sensors."
tier: flagship
order: 5
date: 2023-06-01
tags:
  - Computer Vision
  - Teleoperation
  - Depth Sensing
  - Research
# header:
#   teaser: /assets/images/kuka-teleop.jpg
toc: true
toc_sticky: true
---

## Overview

Master's research in the Department of Electrical Communication Engineering at
**IISc Bengaluru** (2020–2023), on making industrial manipulators teleoperable through
ordinary human movement rather than specialised hardware.

Teleoperation extends a robot's usable range into unstructured environments and onto
unfamiliar objects by keeping a human in the loop for the parts that are hard to automate:
scene interpretation, task decomposition, and recovery when something goes wrong. The
practical barrier is usually the interface. High-fidelity teleoperation conventionally
requires a **motion-capture system, wearable sensors, or a haptic master device** — all
expensive, all requiring calibration and operator setup, none of which travel well outside a
lab.

This work replaces that hardware with a **single depth camera**.

## Approach

A **vision-based teleoperation system for the KUKA LBR IIWA** that tracks the natural motion
of a human operator observed by a depth camera and maps it, in real time, onto the
manipulator — so the operator simply moves their arm and the robot follows, with nothing worn
and nothing instrumented.

The loop is closed in both directions. Cameras mounted on the robot side stream views of the
manipulator's activity back to the operator as **visual feedback**, which is what makes the
system usable for real manipulation rather than only open-loop gesture mimicry: the operator
sees the consequences of their motion from the robot's vantage point, not just their own.

The result is efficient imitation-based control of an industrial arm **without any costly
motion-capture or wearable sensing hardware**, which lowers the setup cost of teleoperation
enough to be deployed rather than demonstrated.

## Why it connects to my current work

The through-line from this research to my
[imitation-learning projects](/projects/act-panda-pick-place/) is direct: both are about
transferring human manipulation skill to a robot, and both live or die on the quality of the
human-to-robot interface. Vision-based teleoperation is how you *collect* natural
demonstrations cheaply; policies like ACT and Diffusion Policy are how you *stop needing the
human in the loop*. The teleoperation work is upstream of the learning work, and building
both ends has made the data-quality trade-offs in the learning half much more legible.

---

*A fuller write-up including system architecture, the tracking and mapping pipeline, and
quantitative results is in progress.*
