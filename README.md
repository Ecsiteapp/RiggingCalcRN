# ECS Rigging Calc

Internal React Native app for **theatrical flying rig** force and geometry calculations. Built with **Expo SDK 54**, **React Native 0.81**, and the **New Architecture** enabled.

| Item | Value |
|------|--------|
| Android package | `com.ecsiteapp.riggingcalc` |
| Display name | ECS Rigging Calc |
| JS entry | `index.js` → `App.js` |

---

## Prerequisites

- **Node.js** — current LTS (v20 or v22 recommended)
- **npm** (bundled with Node)
- **For Android:** [Android Studio](https://developer.android.com/studio) with SDK, platform tools, and an emulator or physical device with USB debugging

Optional: **Xcode** (macOS only) if you work on iOS.

---

## Setup

```bash
git clone <repository-url>
cd RiggingCalcRN
npm install
```

No `.env` file is required for local development today; environment loading uses Expo’s defaults (`.env`, `.env.local` if you add them later).

---

## Development

Start the Metro bundler (JavaScript):

```bash
npm start
# same as: npx expo start
```

### Android (device or emulator)

In a second terminal, from the **project root** (not only `android/`):

```bash
npm run android
# same as: npx expo run:android
```

Ensure an emulator is running (`adb devices` shows `device`) or a phone is connected with debugging enabled. The native build expects Metro on **http://localhost:8081** for debug builds.

### iOS (macOS)

```bash
npm run ios
```

### Web

```bash
npm run web
```

---

## Android release APK (shareable build)

From the project root:

```bash
cd android && ./gradlew assembleRelease && cd ..
```

Output:

`android/app/build/outputs/apk/release/app-release.apk`

Install on a test device by sideloading the APK (enable install from your file source / browser as needed).

---

## Project layout (high level)

| Path | Purpose |
|------|--------|
| `App.js` | Root UI: login vs calculator |
| `src/` | Screens, theme, rigging logic |
| `assets/` | Icons and splash images |
| `app.json` | Expo app config (name, Android package, new arch, etc.) |
| `android/` | Native Android project (Gradle) |

---

## Native Android notes

- **Autolinking** is configured in `android/settings.gradle` using Expo’s Gradle plugins and `com.facebook.react.settings` (required for React Native 0.81 + Expo).
- SDK versions and toolchains are managed by **Expo’s root Gradle plugin** (`expo-root-project`); see build output for resolved `compileSdk`, NDK, Kotlin, etc.

---

## Internal developer reference — credentials

> **Private / internal only.** Do not publish this repository or README to public channels. Rotate passwords and signing keys if this repo ever leaks.

### App login (demo / staging UI)

Used by `src/LoginScreen.js` for the in-app gate (not a remote API today).

| Field | Value |
|-------|--------|
| Email | `ehsmanager@ecsiteapp.com` |
| Password | `R!gg1ng@ECS#2025` |

To change these, edit the `CREDENTIALS` object in `src/LoginScreen.js`.

### Android debug keystore

Path (relative to `android/app/`): `debug.keystore`

| Property | Value |
|----------|--------|
| Store password | `android` |
| Key alias | `androiddebugkey` |
| Key password | `android` |

These match the standard Android debug keystore convention and are defined in `android/app/build.gradle` under `signingConfigs.debug`.

### Release APK signing (current setup)

**Release builds are currently signed with the same debug keystore** (`signingConfig signingConfigs.release` → debug config). That is acceptable for **internal QA and sideloaded test APKs**. Before **Google Play** or any public release, create a **dedicated release keystore**, store it securely, and update `android/app/build.gradle` accordingly ([React Native: signed APK](https://reactnative.dev/docs/signed-apk-android)).

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| `autolinking.json` missing / Gradle configure fails | Ensure `android/settings.gradle` matches the Expo 54 template (React settings plugin + `expo-autolinking-settings`). Run `npm install` from repo root. |
| Metro connection / white screen on device | Start `npm start` first; for a physical device, you may need `npx expo start --tunnel` or the LAN IP in dev settings. |
| Wrong Node picked up by Gradle | `android/app/build.gradle` prefers Homebrew paths for `node`; install Node via [nodejs.org](https://nodejs.org/) or Homebrew and ensure `which node` works in a terminal. |

---

## License

Private / internal — all rights reserved unless otherwise agreed by the project owners.
