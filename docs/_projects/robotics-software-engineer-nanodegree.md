---
title: "ROS Robotics — Localization, SLAM and Autonomous Navigation"
excerpt: "Udacity Robotics Software Engineer Nanodegree coursework: building a robot in Gazebo from scratch, then giving it perception, Monte Carlo localization, RTAB-Map SLAM, and an autonomous home-service navigation stack."
tier: coursework
order: 11
date: 2021-06-01
tags:
  - ROS
  - SLAM
  - Gazebo
  - C++
# header:
#   teaser: /assets/images/ros-slam.jpg
toc: true
---

## Programme

**Udacity Robotics Software Engineer Nanodegree** (nd209). Five projects in ROS and C++ that
build cumulatively: each one adds a capability to the same robot, ending with a full
autonomous service task. The sequencing is deliberate — you cannot localise without a robot
and sensors, cannot map without localisation, and cannot navigate without a map.

## Projects

### Build My World

Construct a simulated environment and a mobile robot from the ground up: a **Gazebo** world,
a robot described in **URDF/SDF** with links, joints, inertial properties and collision
geometry, sensor plugins for a camera and a lidar, and a differential-drive controller
plugin. Getting inertia tensors and collision meshes right is where most of the real work
is, and getting them wrong produces a robot that quietly refuses to behave.

### Go Chase It!

A perception-to-action loop across two ROS nodes: one processes the camera stream to detect a
coloured ball and locate it horizontally in the image, the other translates that into
differential-drive velocity commands over a **ROS service**, steering the robot toward the
ball. Small, but it is the first complete sense-decide-act cycle and establishes the node,
topic, message and service structure everything later depends on.

### Where Am I

Global localisation with **AMCL** (adaptive Monte Carlo localisation) — a particle filter
maintaining a distribution over poses, weighting particles by how well their expected lidar
readings match the actual scan, resampling toward agreement, and adapting the particle count
to the current uncertainty. Tuned against a known map, with `move_base` for navigation.
The instructive part is watching the particle cloud collapse as the robot moves through
geometrically distinctive parts of the map and spread again in featureless corridors, which
makes the observability of the problem concrete.

### Map My World

**Graph-based SLAM** with **RTAB-Map** using RGB-D input: appearance-based loop closure
detection to recognise revisited places, pose-graph optimisation to distribute the resulting
correction across the whole trajectory, and 2-D occupancy plus 3-D point-cloud map output.
Loop closure is what separates SLAM from dead reckoning — without it, odometry drift is
unbounded.

### Home Service Robot (capstone)

The full stack integrated: SLAM to build the map, AMCL to localise within it, and
**`move_base`** for navigation, with a global planner over the costmap and a local planner
handling dynamic obstacle avoidance. On top of that sits a task layer that sends the robot to
a pickup location, simulates collecting an object, and delivers it to a drop-off, with
markers visualising object state in RViz.

## What stuck

- ROS's value is the interface contract. Nodes, topics and services let perception, control
  and planning be developed and debugged independently, which is the only way a stack this
  size stays tractable.
- Localisation and mapping are the same estimation problem viewed from different ends, which
  is why doing them simultaneously needs loop closure to stay consistent.
- Simulation fidelity is load-bearing. Bad inertial or friction parameters produce
  "algorithm" bugs that are actually physics bugs.
