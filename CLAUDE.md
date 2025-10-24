# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Expo-based React Native application for tax tracking, using the modern Expo Router for file-based navigation. The app is built with TypeScript and supports iOS, Android, and web platforms.

## Development Commands

### Setup and Running
- `npm install` - Install dependencies
- `npm start` or `npx expo start` - Start the development server
  - Scan the QR code with Expo Go app on your phone for testing on physical devices
  - Or use the interactive menu to launch on iOS simulator, Android emulator, or web
- `npm run ios` - Start on iOS simulator directly
- `npm run android` - Start on Android emulator directly
- `npm run web` - Start on web directly

### Code Quality
- `npm run lint` - Run ESLint using Expo's configuration

## Architecture

### Routing
This project uses **Expo Router** (file-based routing). Routes are defined by the file structure in the `app/` directory:
- `app/_layout.tsx` - Root layout component wrapping all routes with a Stack navigator
- `app/index.tsx` - Home screen (root route `/`)
- File-based routing means you create new screens by adding files to the `app/` directory

### TypeScript Configuration
- Strict mode enabled
- Path alias: `@/*` maps to the project root
- Extends Expo's base TypeScript config

### Expo Configuration (`app.json`)
- **New Architecture Enabled**: React Native's new architecture is turned on
- **Typed Routes**: Type-safe navigation via experimental feature
- **React Compiler**: Experimental React compiler enabled
- Edge-to-edge display on Android
- Supports iOS tablets
- Universal app targeting iOS, Android, and web (static output)

### Project Structure
```
app/               - File-based routes (Expo Router)
assets/            - Images, fonts, and other static assets
components/        - Reusable React components (currently empty)
constants/         - App-wide constants (currently empty)
hooks/             - Custom React hooks (currently empty)
```

## Key Dependencies

### Core Framework
- **Expo SDK ~54.0** with React 19.1.0 and React Native 0.81.5
- **Expo Router ~6.0** for file-based navigation

### Navigation
- React Navigation v7 with bottom tabs and native components
- React Native Screens and Gesture Handler for native navigation performance

### Animation & Interaction
- React Native Reanimated ~4.1 for performant animations
- React Native Worklets for off-thread JavaScript execution
- Expo Haptics for haptic feedback

### Platform Integration
- Expo Font, Image, Linking, Web Browser
- Safe Area Context for proper spacing on notched devices
- Expo Status Bar and System UI for system-level UI control

## Development Notes

- The app uses React 19.1.0 (latest stable) with full TypeScript support
- When adding new screens, create files in the `app/` directory following Expo Router conventions
- Use `@/` import alias for cleaner imports (e.g., `import { Button } from '@/components/button'`)
- The project is configured for the New React Native Architecture - be aware of potential compatibility issues with older libraries
