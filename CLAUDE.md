# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Is

Rovia is a React Native / Expo travel guide app for **Strasbourg, France**. It provides sights, restaurants, museums, Batorama boat tours, real-time public transport (CTS tram/bus), live parking data, and an itinerary planner. The app targets tourists and supports 9 languages.

## Commands

```bash
# Start dev server (opens Expo DevTools)
npm start

# Run on Android emulator
npm run android

# Run on iOS simulator
npm run ios

# Run as web app
npm run web

# Lint
npm run lint
```

There is no test suite. TypeScript strict mode is enabled — always ensure type correctness.

## Architecture

### Navigation & Tab System

The entire app is rendered by a single `UnifiedTabs` component (`components/UnifiedTabs.tsx`). Instead of using React Navigation's tab navigator, it implements a custom **horizontal swipe-based tab system** with 5 panels laid out side by side using `Animated.View` + `react-native-reanimated`. Tabs are:

- Index 0: **Map** (full-screen Mapbox, tab bar hidden)
- Index 1: **Home** (`HomeContent`)
- Index 2: **Explore** (`ExploreContent`) — category filter bar animates up above tab bar
- Index 3: **Itinerary** (`ItineraryContent`)
- Index 4: **Transport** (`TransportContent`) — lazy-loaded on first visit

`app/index.tsx` just renders `<UnifiedTabs />`. `app/_layout.tsx` is the root: wraps with `GestureHandlerRootView`, `FavoritesProvider`, `ThemeProvider`, and renders an `AnimatedSplashScreen` overlay until dismissed.

### Separate Routes

- `app/sight/[id].tsx` — POI detail page (navigated via `router.push`)
- `app/batorama.tsx` — Batorama boat tour (navigated via `router.push`, not a tab)

### Screen Components

All tab content lives in `components/screens/`:
- `HomeContent.tsx` — Landing with highlights and quick navigation
- `ExploreContent.tsx` — Searchable/filterable grid of POIs
- `MapContent.tsx` — Full Mapbox map with POI markers and transport overlays
- `TransportContent.tsx` — CTS real-time arrivals + parking widget
- `ItineraryContent.tsx` — Draggable favorites list using `react-native-draggable-flatlist`
- `BatoramaContent.tsx` — Batorama boat tour info and map route

### Theme & Styling

`constants/theme.ts` exports `Colors` (light/dark token objects) and `Fonts`. The primary accent color is `#C9524A`. Components receive `theme` as a prop (sourced from `Colors[colorScheme]`) rather than using a context. Always use tokens from `Colors` rather than hardcoding hex values.

### Data

All POI data is static TypeScript files in `data/`:
- `sights.ts`, `museums.ts`, `restaurants.ts` — typed `Sight[]` arrays with optional `translations` per locale
- `categories.ts` — category definitions with colors and i18n keys
- `transport_data.ts`, `tram_geojson.ts`, `tram_segments.ts` — static CTS route/stop data
- `batorama.ts`, `batorama_locations.ts` — Batorama boat tour stops

Live data comes from two sources:
- **CTS API** (`utils/cts.ts`): real-time tram/bus arrivals via `https://api.cts-strasbourg.eu/v1/siri/2.0`
- **Parking API** (`hooks/useParkingData.ts`): live parking availability

### Persistence

`utils/storage.ts` is a safe wrapper around `@react-native-async-storage/async-storage` that falls back to `localStorage` on web and in-memory on native if the native module isn't available. All persistent state (favorites, language preference) goes through this wrapper.

### Internationalisation

`i18n/index.ts` uses `i18n-js`. Translations for 9 languages (en, fr, de, es, it, ru, tr, pt + more) are hardcoded in that file. Use `i18n.t('key')` for UI strings. For data items that have per-locale content, use the `tData(item, field)` helper which reads from `item.translations[locale][field]` with fallback to the default field.

### Path Aliases

`@/` maps to the repo root (configured in `tsconfig.json`). Always use `@/` imports rather than relative paths.

### Mapbox

Mapbox is initialized once in `app/_layout.tsx` and again in `app/sight/[id].tsx` with the same public token. Uses `@rnmapbox/maps` (native) and `mapbox-gl` (web).
