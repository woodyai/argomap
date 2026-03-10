# ArgoMap --- Map Data Structure Design

## Design Goal

Create a flexible data model that supports:

-   Countries
-   Cities
-   Memories
-   Photos
-   Future SaaS expansion

------------------------------------------------------------------------

# 1. Core Hierarchy

    World
     ↓
    Country
     ↓
    City
     ↓
    Memory

------------------------------------------------------------------------

# 2. Country Schema

countries.json

``` json
{
  "code": "JP",
  "name": "Japan",
  "visited": true,
  "cities": ["tokyo", "kyoto"]
}
```

Fields:

-   code
-   name
-   visited
-   cities\[\]

------------------------------------------------------------------------

# 3. City Schema

cities.json

``` json
{
  "id": "tokyo",
  "country": "JP",
  "name": "Tokyo",
  "lat": 35.6762,
  "lng": 139.6503,
  "visited_at": "2024-04",
  "emotion": 5
}
```

Fields:

-   id
-   country
-   name
-   latitude
-   longitude
-   visit date
-   emotion score

------------------------------------------------------------------------

# 4. Memory Schema

memories.json

``` json
{
  "city": "tokyo",
  "title": "First Day in Tokyo",
  "date": "2024-04-05",
  "emotion": 5,
  "diary": "Today we explored Shibuya...",
  "photos": [
    "tokyo/shibuya1.jpg",
    "tokyo/sushi.jpg"
  ],
  "recommendations": [
    "Best Sushi Place",
    "Shibuya Crossing"
  ]
}
```

------------------------------------------------------------------------

# 5. Photo Storage

Structure:

    /photos
       /tokyo
       /kyoto

Future cloud storage:

-   Cloudflare R2

------------------------------------------------------------------------

# 6. Map Marker Data

Example marker:

``` json
{
  "city": "tokyo",
  "lat": 35.6762,
  "lng": 139.6503,
  "visited": true
}
```

------------------------------------------------------------------------

# 7. Future SaaS Expansion

User-level structure:

    User
     ↓
    Map
     ↓
    Countries
     ↓
    Cities
     ↓
    Memories

Example:

    argo.argomap.com
    john.argomap.com

------------------------------------------------------------------------

# 8. API Possibility (Future)

Example endpoints:

    GET /api/countries
    GET /api/cities
    GET /api/memories
    POST /api/memory

------------------------------------------------------------------------

# Result

This structure allows:

-   Static JSON MVP
-   Easy migration to database
-   Future SaaS scaling
