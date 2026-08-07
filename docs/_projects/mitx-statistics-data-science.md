---
title: "MITx Statistics and Data Science — Applied Projects"
excerpt: "MicroMasters coursework: sentiment analysis, MNIST classification and a reinforcement-learning text agent from 6.86x, plus four applied statistics case studies in genomics, criminal networks, economic time series and spatial data from 6.419x."
tier: coursework
order: 14
date: 2024-06-01
tags:
  - Machine Learning
  - Statistics
  - Time Series
  - Python
# header:
#   teaser: /assets/images/mitx.jpg
toc: true
---

## Programme

**MITx MicroMasters in Statistics and Data Science**, a graduate-level programme spanning
probability, statistics, machine learning and time series. Two of its courses are
project-driven, and those projects are the substance of this page.

Coursework: Probability — The Science of Uncertainty and Data (6.431x) · Fundamentals of
Statistics (18.6501x) · Machine Learning with Python (6.86x) · Data Analysis: Statistical
Modeling and Computation in Applications (6.419x) · Learning Time Series with Interventions
(IDS.S24x).

## 6.86x — Machine Learning with Python

Four projects, each implemented from scratch in NumPy rather than assembled from
scikit-learn calls. The sequence is deliberately historical: it walks from linear classifiers
to deep networks to reinforcement learning, so you build each method knowing precisely which
limitation of the previous one it exists to fix.

### Automatic review analyzer

Sentiment classification on product reviews with linear classifiers implemented by hand:
**perceptron**, average perceptron, and **Pegasos** (hinge loss with L2 regularisation),
including feature engineering from bag-of-words and hyperparameter search. Implementing the
update rules directly is what makes the connection between a loss function and the resulting
gradient step concrete instead of notational.

### Digit recognition — MNIST

Two parts, and the contrast between them is the lesson. First, classical methods: linear
regression as a classifier (and *why* it is a poor one), **SVMs**, **softmax regression**,
polynomial and radial-basis feature maps, and **PCA** for dimensionality reduction. Then
neural networks: a fully-connected network with backpropagation written from scratch, followed
by a **CNN** — where convolution's weight sharing and translation equivariance produce the
step change in accuracy that no amount of feature engineering on the linear models achieves.

### Collaborative filtering via Gaussian mixtures

Netflix-style rating prediction as a **mixture model** with an **EM algorithm** handling
incomplete data — most user-movie pairs are unobserved, which is exactly the case EM is
designed for. Includes K-means for comparison, log-likelihood-based convergence monitoring,
and **BIC** for choosing the number of mixture components. The conceptual payoff is seeing
K-means as a hard-assignment special case of the soft-assignment E-step.

A standalone implementation of the EM and K-means algorithms from this work is on GitHub:
[Naive_EM](https://github.com/magician6174/Naive_EM).

### Text-based game — reinforcement learning

An agent learning to play a text adventure, with state represented from natural-language
descriptions. Tabular **Q-learning** and SARSA first, then a **deep Q-network** once the state
space becomes too large to enumerate — which is a clean demonstration of function
approximation as the answer to a specific, identifiable scaling failure rather than a
fashionable default.

## 6.419x — Data Analysis: Statistical Modeling and Computation in Applications

Four applied modules, each a substantial case study on real data in a different domain. The
recurring theme is that the statistical method is chosen by the structure of the data, not by
preference.

**Epigenetic codes and data visualisation.** Analysis of single-cell RNA-sequencing data:
dimensionality reduction with **PCA** and **t-SNE**, unsupervised clustering to recover cell
types, classification, and — critically — **multiple hypothesis testing** correction, because
testing tens of thousands of genes makes uncorrected p-values meaningless.

**Criminal networks and network analysis.** Graph-theoretic analysis of a covert
organisation: **centrality measures** (degree, betweenness, eigenvector) to identify
structurally important actors, community detection, and reasoning about how network structure
changes over time under disruption.

**Prices, economics and time series.** Time-series modelling of economic data: trend and
seasonality decomposition, stationarity testing, autocorrelation structure, **ARIMA**-family
models, and forecasting with honest uncertainty quantification.

**Environmental data and spatial statistics.** Spatial and spatio-temporal analysis of
environmental measurements, including **Gaussian processes** and kriging for interpolation
over space, and correlation structure across both spatial and temporal dimensions.

## IDS.S24x — Learning Time Series with Interventions

Graduate-level time series along three lines: learning the **structured stochastic dynamic
model** generating the series, **prediction** under that model, and **reinforcement learning**
where actions intervene on the process. The interventional framing is what distinguishes it
from standard forecasting — the question is not only what will happen, but what happens if you
act.

## Status

Coursework complete; the final MicroMasters **capstone exam is pending**.

## What stuck

- Implementing methods from scratch changes what you understand. Writing the EM update or the
  backpropagation pass by hand exposes the assumptions a library call hides.
- The applied modules made model selection feel like a consequence of data structure —
  network data wants graph methods, spatial data wants covariance over distance, and the
  reason is legible in the data rather than in a flowchart.
- Multiple hypothesis testing is not a footnote. At genomic scale it is the difference between
  a result and noise.
