---
title: "Monocular Visual Odometry on KITTI"
excerpt: "Estimated motion between frames from a single camera using Nistér’s five-point method, RANSAC and essential-matrix decomposition in C++ and OpenCV."
tier: flagship
order: 8
category: "Computer vision and state estimation"
tags:
  - C++
  - OpenCV
  - KITTI
---

## Relative pose estimation

I built a monocular visual odometry pipeline in C++ with OpenCV and evaluated it using [KITTI odometry data](https://www.cvlibs.net/datasets/kitti/eval_odometry.php).

- Estimated the essential matrix from image correspondences with **Nistér’s five-point algorithm** and used **RANSAC** to reject outliers.
- Recovered the relative camera rotation and translation direction from the essential matrix. The translation has an unknown metric scale when estimated from monocular image pairs alone.
