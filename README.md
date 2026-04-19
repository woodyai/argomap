# ArgoMap

An Astro + React travel memory site for Argo, with a 3D globe, city memories, live Google Maps exploration, weather, and embedded Street View.

## Local Run

```bash
npm install
cp .env.example .env
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:4321/` or `http://127.0.0.1:4321/zh/`.

## Google Maps Setup

Add these values to `.env`:

```bash
PUBLIC_GOOGLE_MAPS_API_KEY=your_demo_or_standard_key_here
PUBLIC_GOOGLE_MAPS_MAP_ID=your_optional_cloud_map_id_here
```

Notes:
- `PUBLIC_GOOGLE_MAPS_API_KEY` is required for the live map, place search, weather, and embedded Street View.
- `PUBLIC_GOOGLE_MAPS_MAP_ID` is optional. Leave it out if you just want to prototype with the current fallback.
- The current UI uses Maps JavaScript API, Places widgets, Weather API, and embedded Street View via the Maps JavaScript API.

## Commands

```bash
npm run dev
npm run build
npm run preview
```
