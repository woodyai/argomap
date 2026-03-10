# ArgoMap --- UX Architecture Design

## Product Concept

ArgoMap is an **interactive life map** that turns memories into places.
The core navigation logic:

Life → Map → Country → City → Memory

------------------------------------------------------------------------

# 1. Global UX Structure

    Home
    │
    ├── Life Map
    │     │
    │     ├── Country Page
    │     │       │
    │     │       └── City Page
    │     │              │
    │     │              └── Memories
    │
    ├── Gallery
    ├── Timeline
    └── About

URLs:

    /
    /map
    /country/{country}
    /city/{city}
    /gallery
    /timeline
    /about

------------------------------------------------------------------------

# 2. User Journey

Typical first visit:

    Landing
     ↓
    Animated Earth
     ↓
    Click Explore
     ↓
    World Map
     ↓
    Click Country
     ↓
    Zoom Country
     ↓
    Click City
     ↓
    Open Memory

------------------------------------------------------------------------

# 3. Page Layouts

## Home

Purpose: create emotion and discovery.

Layout:

    Navigation

          🌍
    Argo's Life Map

    Explore the World

    [ Explore Map ]

Background:

-   Star field
-   Rotating earth
-   Heartbeat glow

------------------------------------------------------------------------

## Life Map

    ------------------------------------------
    Map (Left)          | Content Panel
    ------------------------------------------

    World Map           | Selected City
                        | Photos
                        | Diary
                        | Emotion
    ------------------------------------------

Interaction:

-   hover country → highlight
-   click country → zoom
-   click city → open memory panel

------------------------------------------------------------------------

## Country Page

Example:

    /country/japan

Content:

-   Cities visited
-   Photo highlights
-   Map zoomed to country

------------------------------------------------------------------------

## City Page

Example:

    /city/tokyo

Layout:

    Tokyo 🇯🇵
    Visited: Apr 2024

    Photos
    [grid]

    Diary

    Emotion

    Recommendations

------------------------------------------------------------------------

## Gallery

Content:

-   Drawings
-   Photography
-   Artworks

Layout:

Masonry grid

Click:

Fullscreen viewer

------------------------------------------------------------------------

## Timeline

Example:

    2017 — Born
    2019 — First Trip
    2022 — First Camera
    2024 — 10 Countries

Vertical scroll timeline.

------------------------------------------------------------------------

# 4. Map Interaction Model

Hierarchy:

    Earth
     ↓
    World Map
     ↓
    Country Zoom
     ↓
    City Marker
     ↓
    Memory Panel

Markers:

Unvisited: gray\
Visited: deep blue

Hover: glow\
Click: zoom

------------------------------------------------------------------------

# 5. Mobile UX

Layout:

    MAP
    ↓
    CITY PANEL

Interactions remain identical.

------------------------------------------------------------------------

# UX Design Principles

1.  Simple enough for a child
2.  Feels like exploration
3.  Map tells a story
