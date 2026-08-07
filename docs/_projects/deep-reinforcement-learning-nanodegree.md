---
title: "Deep Reinforcement Learning — Value, Policy and Multi-Agent Methods"
excerpt: "Udacity Deep RL Nanodegree coursework: a DQN agent for discrete control, DDPG for continuous robotic actuation, and MADDPG for cooperative multi-agent play, in Unity ML-Agents environments."
tier: coursework
order: 12
date: 2021-11-01
tags:
  - Deep RL
  - PyTorch
  - DQN
  - DDPG
# header:
#   teaser: /assets/images/deep-rl.jpg
toc: true
---

## Programme

**Udacity Deep Reinforcement Learning Nanodegree** (nd893). Three projects in PyTorch on
Unity ML-Agents environments, structured to walk through the three regimes that need
genuinely different algorithms: discrete actions, continuous actions, and multiple
simultaneously learning agents.

## Projects

### Navigation — value-based control

A **Deep Q-Network** agent in a large square world, collecting yellow bananas and avoiding
blue ones from a 37-dimensional ray-perception state and four discrete actions. Covers the
two tricks that make Q-learning work with a neural function approximator: **experience
replay** to break the temporal correlation that violates the i.i.d. assumption, and a
**target network** updated slowly to stop the bootstrap target from moving with every
gradient step. Extended with **Double DQN** to correct the maximisation bias in the standard
target, and **duelling** architectures to separate state value from action advantage.

### Continuous Control — policy gradient for actuation

A double-jointed arm tracking a moving target, with a **continuous** 4-dimensional action
space of joint torques — where DQN does not apply, because you cannot take a max over an
uncountable action set. Solved with **DDPG**, an off-policy actor-critic method: a
deterministic actor outputs actions directly, a critic evaluates them, and exploration comes
from added action noise rather than from stochastic action selection. Trained in the
distributed 20-agent variant, where parallel agents feeding one shared replay buffer
dramatically improve sample efficiency and stability. This is the project closest to real
robotics, since joint-torque control is the actual actuation problem.

### Collaboration and Competition — multi-agent

Two agents controlling rackets to keep a ball in play, trained with **MADDPG**. The core
difficulty is that from any single agent's perspective the environment is
**non-stationary** — the other agent's policy is changing, so the transition dynamics it
experiences change with it, breaking the stationarity assumption every single-agent method
relies on. MADDPG's answer is centralised training with decentralised execution: each critic
sees all agents' observations and actions during training, while each actor uses only its own
observation at execution time.

## What stuck

- The action space determines the algorithm family. Discrete permits value-based methods;
  continuous forces policy-based or actor-critic methods, because you cannot enumerate a max.
- Most of deep RL's machinery — replay buffers, target networks, soft updates, action noise —
  exists to repair assumptions that neural function approximation breaks. Knowing *which*
  assumption each component protects is what lets you debug a non-learning agent.
- Multi-agent learning is not single-agent learning scaled up. Non-stationarity is a
  qualitative change requiring a structurally different training scheme.
