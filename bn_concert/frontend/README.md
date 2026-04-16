# BNConcert (Frontend)

React Native mobile app built with Expo SDK 54, TypeScript, and expo-router v6.

## Prerequisites

- **Node.js** >= 18 (tested with v22)
- **npm** (comes with Node.js)
- **Expo Go** app on your phone — [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779)

## Setup

```bash
# Navigate to frontend directory
cd bn_concert/frontend

# Install dependencies (--legacy-peer-deps required due to React 19 peer conflict)
npm install --legacy-peer-deps

# Create .env file (or edit the existing one)
cp .env.example .env
```

### Environment Variables (`.env`)

| Variable | Example | Description |
|----------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | `http://192.168.1.100:8000/api` | Backend API URL — **use your LAN IP** |

> **Important**: Replace `192.168.1.100` with your computer's actual LAN IP address.
> Find it with `ipconfig` (Windows) or `ifconfig` (Mac/Linux).
> `localhost` won't work from a physical device.

## Run

```bash
# Start the Expo development server
npx expo start
```

Then:
- **Phone**: Scan the QR code with Expo Go (Android) or Camera (iOS)
- **Android emulator**: Press `a`
- **iOS simulator**: Press `i` (macOS only)

## Demo Account

```
Email:    sylvievanbeek@gmail.com
Password: password123
```

## Key npm Commands

```bash
# Install a new package (always use --legacy-peer-deps)
npm install <package> --legacy-peer-deps

# Type check
npx tsc --noEmit

# Clear Expo cache
npx expo start --clear
```

## Project Structure

```
frontend/
├── app/                        # expo-router file-based routing
│   ├── _layout.tsx             # Root layout (providers)
│   ├── index.tsx               # Entry redirect
│   ├── (auth)/                 # Auth stack
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                 # Bottom tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Home
│   │   ├── tickets.tsx         # All Concerts
│   │   ├── search.tsx          # Search
│   │   ├── blog.tsx            # Blog listing
│   │   └── profile.tsx         # Profile / Dashboard menu
│   ├── concert/[id].tsx        # Concert detail
│   ├── artist/[id].tsx         # Artist detail
│   ├── blog/[slug].tsx         # Blog article + comments
│   ├── buy/[concertId]/        # Buy ticket flow
│   │   ├── _layout.tsx         # Step indicator
│   │   ├── index.tsx           # Section selection
│   │   ├── seats.tsx           # Seat map
│   │   ├── confirm.tsx         # Order summary
│   │   ├── payment.tsx         # Payment method
│   │   ├── success.tsx         # Payment success
│   │   └── failed.tsx          # Payment failed
│   └── dashboard/              # User dashboard
│       ├── _layout.tsx
│       ├── orders.tsx
│       ├── order/[id].tsx
│       ├── tickets.tsx
│       ├── gift-cards.tsx
│       ├── payments.tsx
│       ├── settings.tsx
│       ├── help.tsx
│       └── contact.tsx
├── src/
│   ├── api/                    # Axios client + API services
│   ├── components/             # Shared UI components
│   ├── constants/              # Theme, config
│   ├── context/                # Auth context provider
│   └── types/                  # TypeScript interfaces
├── app.json                    # Expo config
├── package.json
└── tsconfig.json
```

## Tech Stack

| Library | Purpose |
|---------|---------|
| Expo SDK 54 | React Native framework |
| expo-router v6 | File-based navigation |
| @react-navigation/bottom-tabs | Tab bar |
| axios | HTTP client |
| expo-secure-store | Secure token storage |
| expo-image | Optimized image loading |
| react-native-reanimated | Animations |
| @expo/vector-icons (Ionicons) | Icons |
