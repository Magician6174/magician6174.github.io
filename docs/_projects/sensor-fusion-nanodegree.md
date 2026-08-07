---
title: "Sensor Fusion — Lidar, Radar, Camera and Kalman Filtering"
excerpt: "Udacity Sensor Fusion Nanodegree coursework: lidar obstacle detection from raw point clouds, camera-based time-to-collision, FMCW radar target detection, and an Unscented Kalman Filter fusing them all."
tier: coursework
order: 10
date: 2022-01-01
tags:
  - C++
  - Kalman Filters
  - Point Clouds
  - Radar
# header:
#   teaser: /assets/images/sensor-fusion.jpg
toc: true
---

## Programme

**Udacity Sensor Fusion Engineer Nanodegree** (nd313), developed with Mercedes-Benz
engineers. Four projects in C++, one per sensing modality, converging on a fused
multi-sensor tracker. The organising idea is that every sensor has a complementary failure
mode — lidar gives precise geometry but no velocity and degrades in weather, radar gives
direct radial velocity at poor angular resolution, cameras give rich semantics but no metric
depth — and fusion is how you build a percept none of them can produce alone.

## Projects

### Lidar obstacle detection

Full perception pipeline over raw point clouds using PCL: voxel-grid downsampling and
region-of-interest cropping, **RANSAC** plane segmentation to separate ground from
obstacles, **euclidean clustering over a KD-tree** to group the remaining points into
objects, and oriented bounding boxes per cluster. The segmentation and clustering algorithms
are implemented from scratch rather than called from the library, which is the point of the
exercise.

### Camera-based 2D feature tracking and time-to-collision

Keypoint detection, descriptor extraction, and descriptor matching across frames
(HARRIS / FAST / BRISK / ORB / AKAZE / SIFT paired with BRIEF / ORB / FREAK / SIFT), with a
systematic benchmark of detector-descriptor combinations on both match quality and runtime.
The tracked keypoints then drive **time-to-collision estimation** from two sources — camera
keypoint scale change and lidar range — which exposes how sensitive monocular TTC is to
outlier matches, and why the median rather than the mean is the right statistic.

### Radar target generation and detection

Simulation and detection for an **FMCW** radar: generate the transmit and receive signals
for a moving target, recover range from beat frequency and velocity from Doppler shift via a
2-D FFT into a **range-doppler map**, then suppress noise with **CA-CFAR** (cell-averaging
constant false alarm rate) thresholding using training and guard cells around each cell
under test.

### Unscented Kalman Filter fusion

An **Unscented Kalman Filter** with a **CTRV** (constant turn rate and velocity) motion
model, fusing lidar and radar measurements to track multiple vehicles. The UKF is the right
tool here because CTRV dynamics and the radar measurement function are both nonlinear: the
UKF propagates deterministically chosen sigma points through the true nonlinearity instead
of linearising it as an EKF would. Tuned and validated with **NIS** (normalised innovation
squared) consistency checks against chi-squared bounds — the honest way to verify that the
noise parameters you chose are actually the noise you have.

## What stuck

- The UKF versus EKF choice is about the shape of your nonlinearity, not about wanting a
  better filter. Sigma-point propagation avoids ever computing a Jacobian.
- Filter tuning without a consistency metric is guesswork. NIS turns "the track looks
  reasonable" into a falsifiable claim.
- Constant false alarm rate thresholding exists because a fixed threshold cannot work when
  the noise floor varies across the range-doppler map.
