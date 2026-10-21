# GoodGame (Expo)

A React Native version of the "GoodGame App" Claude Design prototype: the Play, Maps and Profile tabs, check-in with the score animation, join/leave sheets with the $5 deposit copy, region switching, and the map with region pills, sport-colored pins and the game card.

## Run it in the iOS Simulator

You need Node 20+ and Xcode (with an iOS Simulator installed).

```bash
cd goodgame-app
npm install
npx expo start --ios
```

That opens the iOS Simulator and loads the app in Expo Go (Expo installs Expo Go on the simulator the first time). Press `r` in the terminal to reload, `i` to reopen the simulator.

Android emulator: `npx expo start --android`.

## Layout

- `App.tsx`: app state, actions and the bottom sheets (details, join, leave, switch region)
- `src/screens/`: `PlayScreen`, `MapScreen`, `ProfileScreen`
- `src/components/`: the chunky button, tab bar, sheet, toast, game row
- `src/data.ts`: the sample runs, metros and regions from the design
- `src/theme.ts`: colors (design's oklch values converted to hex) and fonts (Archivo, JetBrains Mono)

## Differences from the web prototype

- The map uses Apple Maps (`react-native-maps`, muted style) instead of the Leaflet world outline.
- The phone frame and fake status bar are gone; the app uses the real device status bar and safe areas.
- State is in memory, so it resets when the app reloads.
