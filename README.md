# 🥍 Lacrosse Face-off Trainer

A React Native app to help lacrosse players practice face-off timing and reaction speed with customizable drills and variable timing sequences.

## Features

### Practice Types
- **Down Set Whistle** - Traditional face-off sequence with Down, Set, and Whistle commands
- **Rapid Clamp** - Continuous whistle sounds for clamping practice
- **Three Whistle Drill** - Clamp-Pull-Pop sequence with reset pause

### Customization
- **Variable Timing** - Configurable randomized delays to prevent anticipation
- **Custom Audio** - Record your own voice commands and whistle sounds
- **Practice Settings** - Adjust timing ranges and number of reps for each drill type

## Getting Started

### Prerequisites
- Node.js (LTS version)
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd LacrosseFaceoffApp

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Device
1. Install Expo Go on your iOS/Android device
2. Scan the QR code from the terminal/browser
3. The app will load on your device

## Usage

1. **Select Practice Type** - Tap "START PRACTICE" and choose your drill
2. **Customize Settings** - Access settings to adjust timing and audio
3. **Record Audio** - Create custom voice commands and whistle sounds
4. **Start Training** - Practice with randomized timing to improve reactions

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # Settings and state management
├── screens/            # App screens
├── services/           # Audio and business logic
└── constants/          # Colors and configuration
```

## Built With

- **React Native** - Mobile app framework
- **Expo** - Development platform
- **React Navigation** - Screen navigation
- **Expo AV** - Audio recording and playback
- **AsyncStorage** - Settings persistence

## License

This project is licensed under the MIT License.

---

Made with ❤️ for lacrosse players
