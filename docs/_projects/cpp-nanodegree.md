---
title: "Modern C++ — Systems, Memory and Concurrency"
excerpt: "Udacity C++ Nanodegree coursework: an A* route planner over real OpenStreetMap data, a Linux process monitor, an RAII refactor of a chatbot, and a concurrent traffic simulation."
tier: coursework
order: 13
date: 2022-06-01
tags:
  - C++
  - Concurrency
  - Memory
  - Algorithms
# header:
#   teaser: /assets/images/cpp-nd.jpg
toc: true
---

## Programme

**Udacity C++ Nanodegree** (nd213). Four projects covering the parts of modern C++ that
matter for robotics and performance-sensitive systems: object-oriented design, ownership
semantics, and concurrency.

## Projects

### OpenStreetMap route planner

**A\*** search over a real street network parsed from OpenStreetMap XML, visualised with
IO2D. Implements the full search: an open list ordered by *f* = *g* + *h*, a euclidean-distance
heuristic, neighbour expansion over the road graph, and path reconstruction by walking parent
pointers back from the goal. Because the heuristic never overestimates true road distance, it
is admissible, which is exactly the property that makes A\* optimal rather than merely fast.

### Linux system monitor

An `htop`-style terminal process monitor built with ncurses, reading directly from the
**`/proc`** pseudo-filesystem to report per-process CPU utilisation, memory, uptime and
command lines, plus aggregate system statistics. Structured as a proper object-oriented
design — `System`, `Process`, `Processor` classes with a separated parsing layer — so that
the messy business of scraping kernel-exposed text files stays isolated behind a clean
interface.

### Memory management chatbot

A refactor rather than a greenfield build: take a working chatbot leaking memory through raw
pointers and manual `new`/`delete`, and rewrite its ownership model using modern C++.
Exercises the **rule of five**, move semantics, `unique_ptr` for exclusive ownership,
`shared_ptr` for shared graph nodes, and **RAII** so resource lifetime is tied to scope. The
lesson that transfers everywhere: in C++ you design *ownership*, and correct lifetime
management is a consequence of that design rather than something you remember to do.

### Concurrent traffic simulation

A multi-threaded simulation of vehicles crossing intersections in a city grid. Each vehicle
and each intersection runs on its own thread, coordinating through a **monitor-object message
queue** built from `std::mutex` and `std::condition_variable`, with `std::promise`/
`std::future` for one-shot handoffs and `std::async` for task launching. Traffic lights and
intersection entry permission are the shared resources that must be protected. This is where
the abstract vocabulary of data races, deadlock and lock granularity becomes concrete,
because getting the locking wrong produces a simulation that hangs rather than a compiler
error.

## What stuck

- Ownership is a design decision expressed in types. Once `unique_ptr` and `shared_ptr`
  encode intent, whole categories of leak and double-free become unrepresentable.
- Concurrency bugs are not caught by the compiler and are often not reproducible. The
  defence is structural — confine shared state behind a small number of well-audited
  synchronisation primitives instead of sprinkling locks.
- Familiar algorithms behave differently on real data. A\* on a hand-drawn grid and A\* on a
  city's actual road graph are meaningfully different engineering problems.
