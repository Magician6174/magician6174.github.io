---
layout: single
title: "Projects"
permalink: /projects/
author_profile: false
classes:
  - wide
  - portfolio
---

Things I have built, in two groups: **research and independent work**, where the design
decisions and failure analysis are my own, and **coursework projects**, from structured
programmes where the problem was set but the implementation was mine.

Each entry has a full write-up covering what it does, how it works, and — where it applies —
what went wrong and why. Source releases for the independent robotics work are pending.

## Research & Independent Work

{% assign flagship = site.projects | where: "tier", "flagship" | sort: "order" %}
<div class="grid__wrapper">
  {% for item in flagship %}{% include project-card.html project=item %}{% endfor %}
</div>

## Coursework Projects

Project-based programmes from Udacity and MITx. These are the standard capstone projects each
programme sets, implemented as part of completing it.

{% assign coursework = site.projects | where: "tier", "coursework" | sort: "order" %}
<div class="grid__wrapper">
  {% for item in coursework %}{% include project-card.html project=item %}{% endfor %}
</div>

## Experiments & Miscellany

Smaller pieces — algorithm implementations, puzzles and practice — kept public
because they were fun rather than because they are substantial.

| Repository | What it is |
|---|---|
| [Naive_EM](https://github.com/magician6174/Naive_EM) | Expectation-Maximisation and K-means implemented from scratch on 2-D data, with the soft-versus-hard assignment contrast made explicit |
| [Why_6174](https://github.com/magician6174/Why_6174) | Kaprekar's constant: every four-digit number with at least two distinct digits reaches 6174 in at most seven iterations |
| [GameOfLife](https://github.com/magician6174/GameOfLife) | Conway's Game of Life |
| [LeetCode](https://github.com/magician6174/LeetCode) | Data structures and algorithms practice |
