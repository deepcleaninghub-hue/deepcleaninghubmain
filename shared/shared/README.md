# DeepClean Mobile Hub - Shared Codebase

A modern, well-architected React Native app for DeepClean cleaning services.

## 🏗️ Architecture

This shared codebase follows modern React Native best practices:

- **Single Codebase**: One codebase for both iOS and Android
- **TypeScript**: Full type safety throughout the application
- **Component-Based**: Modular, reusable components
- **Context API**: Centralized state management
- **Navigation**: React Navigation v6 with proper typing
- **Material Design**: React Native Paper for consistent UI

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Base/           # Base components (LoadingSpinner, ErrorDisplay, etc.)
│   └── Service/        # Service-specific components
├── contexts/           # React Context providers
├── navigation/         # Navigation configuration
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   └── main/          # Main app screens
├── services/           # API services and HTTP client
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── config/             # Configuration files
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on specific platforms:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 🧪 Testing

Run tests:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔍 Linting

```bash
# Check for linting errors
npm run lint

# Fix linting errors
npm run lint:fix
```

## 📱 Features

- **Authentication**: Secure login/signup with token management
- **Service Management**: Browse and manage cleaning services
- **Cart System**: Add services to cart with quantity management
- **Booking System**: Create and manage service bookings
- **Profile Management**: User profile and settings
- **Error Handling**: Comprehensive error boundaries and handling
- **Loading States**: Proper loading indicators throughout
- **Accessibility**: Full accessibility support
- **Offline Support**: Caching and offline capabilities

## 🛠️ Development

### Code Style

- Use TypeScript for all new code
- Follow the existing component structure
- Use proper error handling
- Include accessibility props
- Write tests for new components

### Component Guidelines

- Keep components small and focused
- Use proper TypeScript interfaces
- Include proper error boundaries
- Add loading states where appropriate
- Include accessibility support

### State Management

- Use Context API for global state
- Keep local state in components when possible
- Use proper error handling in async operations
- Implement proper loading states

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5001/api
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### API Configuration

The app uses a centralized HTTP client with:
- Automatic token management
- Request/response interceptors
- Error handling
- Retry logic
- Timeout handling

## 📦 Dependencies

### Core Dependencies

- **React Native**: 0.81.4
- **Expo**: ~54.0.0
- **React Navigation**: ^6.1.18
- **React Native Paper**: ^5.11.1
- **TypeScript**: ~5.8.3

### Development Dependencies

- **Jest**: ~29.7.0
- **ESLint**: ^8.45.0
- **Testing Library**: ^13.3.3

## 🚀 Deployment

### Building for Production

1. Configure environment variables
2. Build the app:
```bash
# iOS
expo build:ios

# Android
expo build:android
```

### App Store Deployment

1. Configure app.json with proper bundle identifiers
2. Build production versions
3. Submit to respective app stores

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.
