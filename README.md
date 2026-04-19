# Farming Log

React Native mini-app for farmers to log daily field activities. Built offline-first: data is stored locally and sync runs when the network allows.

---

## Prerequisites (environment)

| Tool | Version / notes |
| --- | --- |
| **Node.js** | **>= 22.11.0** (see `package.json` → `engines`) |
| **Package manager** | npm or Yarn (examples below use `npm`) |
| **Watchman** (macOS, recommended) | [Install Watchman](https://facebook.github.io/watchman/docs/install) for reliable Metro file watching |
| **iOS** | **Xcode** (recent stable, aligned with React Native 0.85), **CocoaPods**, **iOS 15.1+** deployment target |
| **Android** | **Android Studio** with **SDK 36**, **JDK 17** (typical for current AGP / RN), **minSdk 24** |

Also follow the official guide: [Set up your environment](https://reactnative.dev/docs/set-up-your-environment).

---

## Install

1. Clone the repository and install JS dependencies:

   ```sh
   cd farming
   npm install
   ```

2. **iOS — CocoaPods** (first clone and whenever native dependencies change):

   ```sh
   cd ios
   pod install
   cd ..
   ```

3. **Environment files** — the app uses `APP_ENV` (`development` \| `uat` \| `production`) and loads `.env.<APP_ENV>` at build time via Babel (see `babel.config.js`). Ensure `.env.development`, `.env.uat`, etc. exist locally (they are not committed if ignored by git; copy from your team’s secrets template if applicable).

---

## Run the app

Start Metro in one terminal (pick the environment you need):

```sh
npm start                 # APP_ENV=development (default)
npm run start:uat         # APP_ENV=uat
npm run start:production  # APP_ENV=production
```

In another terminal, run the native app.

### Android

```sh
npm run android           # dev debug
npm run android:uat       # uat debug
npm run android:prod      # production debug
```

Release-style builds (examples):

```sh
npm run android:release:dev
npm run android:release:uat
npm run android:release:prod
```

### iOS

```sh
npm run ios               # development
npm run ios:uat           # uat
npm run ios:production    # production (debug)
npm run ios:production:release
```

You can also open `ios/farming.xcworkspace` in Xcode or the `android` folder in Android Studio and run from the IDE.

---

## Tests & quality

```sh
npm test
npm run test:coverage
npm run lint
```

---

## Architecture & library choices

### Folder layout (high level)

| Area | Role |
| --- | --- |
| `src/app/` | App shell: Redux store, root sagas, navigation container, bootstrap (`useAppBootstrap`), typed hooks |
| `src/features/` | Feature UI + hooks (e.g. logs list/add-edit, settings) |
| `src/domain/` | Entities, use cases, repository ports — framework-agnostic |
| `src/data/` | SQLite DAOs, migrations, API clients, repository implementations |
| `src/services/` | Cross-cutting services (e.g. outbox sync engine, background scheduling) |
| `src/ui/` | Shared UI primitives, theme, tokens, navigation helpers |
| `src/config/` | Env-driven config |
| `src/libs/` | i18n, logging, network helpers |

This keeps **UI → state → use cases → persistence/API** in one direction and makes testing and swapping implementations easier.

### State & async

- **Redux Toolkit** for a single predictable store and actions.
- **redux-saga** for side effects (load/save logs, sync triggers) as required by the brief.

### Data & offline

- **react-native-sqlite-storage** for local persistence and migrations.
- **Outbox-style sync** (`src/services/sync/`) plus **NetInfo**-aware bootstrap so writes are local-first and remote sync is best-effort when online.

### Navigation & UI

- **React Navigation** (drawer + native stack) for structure and deep linking readiness.
- **react-native-paper** + internal theme/tokens for a consistent Material-oriented UI without scattering raw styles everywhere.

### Forms & validation

- **react-hook-form** + **Zod** for typed, validated add/edit log flows.

### i18n

- **i18next** / **react-i18next** with JSON resources under `src/locales/` (e.g. Vietnamese + English).

### Other notable libraries

- **Reanimated** / **Gesture Handler** / **Screens** — navigation and animation performance.
- **react-native-bootsplash** — native splash integration.
- **patch-package** — small locked fixes to dependencies (`postinstall`).

---

## Improvements / future enhancements

- **True remote API** — replace or extend the mock `LogsApi` with a real backend, auth, and conflict resolution policies.
- **Richer sync UX** — per-item sync state, retry UI, and clearer error surfaces when sync fails after backoff.
- **Observability** — structured remote logging / crash reporting in non-dev builds.
- **Accessibility** — audit labels, focus order, and dynamic type on key screens.
- **E2E tests** — Detox or Maestro for critical flows (add log → offline → sync).
- **CI** — lint, unit tests, and optional Android/iOS build jobs on every PR.

---

## Troubleshooting

- **Metro / cache**: `npx react-native start --reset-cache`
- **iOS build issues**: clean build folder in Xcode, delete Derived Data, then `cd ios && pod install`
- **React Native setup**: [Troubleshooting](https://reactnative.dev/docs/troubleshooting)

---

## Learn more

- [React Native documentation](https://reactnative.dev/docs/getting-started)
# farmingLog
