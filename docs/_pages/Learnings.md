---
layout: page
title: "Learning, Courses and Certificates"
permalink: /learnings/
---

My formal and self-directed learning across statistics, machine learning, robotics and
software engineering. Where a programme had substantial projects, I have written those up
separately — the links below go to the detailed write-ups on the
[Projects]({{ '/projects/' | relative_url }}) page.

## Education

**M.Tech (Research)** — Department of Electrical Communication Engineering, **IISc Bengaluru**
(2020–2023)
Research on robotic manipulation and vision-based control.
→ [Vision-Based Teleoperation of a KUKA IIWA Industrial Arm]({{ '/projects/kuka-vision-teleoperation/' | relative_url }})

## MicroMasters Programme

### Statistics and Data Science — MITx

A graduate-level programme covering probability, statistics, data analysis, time series and
the foundations of machine learning.

- Probability — The Science of Uncertainty and Data
- Fundamentals of Statistics
- Machine Learning with Python: From Linear Models to Deep Learning
- Data Analysis: Statistical Modeling and Computation in Applications
- [Learning Time Series with Interventions (IDS.S24x)]({{ '/projects/mitx-statistics-data-science/#learning-time-series-with-interventions' | relative_url }}) — seasonal forecasting, low-rank methods for missing data, counterfactual estimation, LQR, and a Q-learning control project

Status: coursework completed, **final capstone exam pending**.

→ [MITx Statistics and Data Science — Applied Projects]({{ '/projects/mitx-statistics-data-science/' | relative_url }})

## Udacity Nanodegree Programmes

Project-based programmes chosen for applied depth rather than breadth of coverage — each one
ends in a working system rather than a quiz.

**Sensor Fusion**
Estimation theory, Kalman filtering, and multi-sensor fusion for autonomous systems.
→ [Lidar, Radar, Camera and Kalman Filtering]({{ '/projects/sensor-fusion-nanodegree/' | relative_url }})

**Robotics Software Engineer**
ROS, localization, mapping, motion planning and robot control.
→ [ROS Robotics — Localization, SLAM and Autonomous Navigation]({{ '/projects/robotics-software-engineer-nanodegree/' | relative_url }})

**Deep Reinforcement Learning**
Value-based, policy-based and multi-agent deep RL methods.
→ [Value, Policy and Multi-Agent Methods]({{ '/projects/deep-reinforcement-learning-nanodegree/' | relative_url }})

**C++**
Modern C++, ownership and memory management, concurrency, and performance-oriented design.
→ [Modern C++ — Systems, Memory and Concurrency]({{ '/projects/cpp-nanodegree/' | relative_url }})

## NPTEL Courses

Advanced technical courses with an emphasis on theoretical foundations and problem solving.

- Advanced Robotics
- Programming in Modern C++
- Modern Computer Vision
- Applied Linear Algebra for Signal Processing, Data Analytics and Machine Learning
- Programming, Data Structures and Algorithms using Python

## Coursera Specializations

- Machine Learning
- Deep Learning
- Mathematics for Machine Learning

## Computer-Aided Design

**Onshape by PTC**

- [Introduction to Part Studios](https://learn.onshape.com/c/s/M132hz_wyv4uXE73-3UU_uSNFaUN2D40rJ3RJunLDi1FVnvQiJc6ygRYOti3JZrO) (issued November 2026)
- [Introduction to Sketching](https://learn.onshape.com/c/s/tvQdadPpU1J5R-Xho48az0DS8EkrdtaDdEM97XhoOBAC24zeGo6TWLAI396tuRMN) (issued November 2025)
- [Introduction to Parametric Feature-Based CAD](https://learn.onshape.com/c/s/YaTkyZ9uDlGB0pZMvB-mN6b00o70MPhW_LuncpA7w1GF90OCjycmkvf9CE8cGlqJ) (issued November 2025)

## Stanford Courses

### Stanford CS224R · Deep Reinforcement Learning

Independent study covering imitation learning, online reinforcement learning
for simulated robot control, and offline reinforcement learning from fixed datasets.

- [Stanford course materials](https://cs224r.stanford.edu/)
- [Homework write-up]({{ '/projects/cs224r/' | relative_url }}){% for homework in site.data.cs224r %}
  - [{{ homework.number }} · {{ homework.title }}]({{ '/projects/cs224r/' | relative_url }}#{{ homework.id }}) — {{ homework.status }}{% endfor %}

### Stanford CME 295 · Transformers and Large Language Models

Completed through independent study. Topics included Transformer architectures,
attention and positional encodings, LLM training and fine-tuning, efficient
inference, and model evaluation.

- [Stanford syllabus and lecture materials](https://cme295.stanford.edu/syllabus/)
- Public practice materials from Fall 2025: [midterm exam](https://cme295.stanford.edu/exams/midterm.pdf) and [final exam with solutions](https://cme295.stanford.edu/exams/final-solutions.pdf).

## Ongoing Self-Directed Work

Alongside formal coursework, my current focus is hands-on robot learning: implementing
state-of-the-art manipulation policies from their papers rather than importing them, and
building the simulation, teleoperation and data-collection infrastructure they depend on.

- [Action Chunking Transformer for Robotic Pick-and-Place]({{ '/projects/act-panda-pick-place/' | relative_url }})
- [Diffusion Policy from Scratch]({{ '/projects/diffusion-policy-panda/' | relative_url }})
- [7-DOF Teleoperation, Inverse Kinematics and Contact Physics]({{ '/projects/panda-teleop-ik/' | relative_url }})
- [QP Differential IK for an Under-Actuated 5-DOF Arm]({{ '/projects/so101-teleop-ik/' | relative_url }})
