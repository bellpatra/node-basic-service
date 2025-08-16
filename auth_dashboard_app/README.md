# Auth Dashboard App

A beautiful Flutter application with authentication and dashboard functionality, featuring a fake API for demonstration purposes.

## Features

- 🔐 **Authentication System**: Login with email and password
- 🎨 **Modern UI**: Beautiful gradient design with Material Design 3
- 📱 **Responsive Design**: Works on all screen sizes
- 🚀 **State Management**: Uses Provider for efficient state management
- 💾 **Local Storage**: Persists authentication state using SharedPreferences
- 📊 **Dashboard**: Interactive dashboard with statistics and navigation
- 🔄 **Fake API**: Simulated API calls with realistic delays

## Demo Credentials

The app comes with pre-configured demo accounts for testing:

| Email | Password | User Name |
|-------|----------|-----------|
| `user@example.com` | `password123` | John Doe |
| `admin@example.com` | `admin123` | Admin User |
| `test@example.com` | `test123` | Test User |

## Getting Started

### Prerequisites

- Flutter SDK (latest stable version)
- Dart SDK
- Android Studio / VS Code
- Android Emulator or iOS Simulator

### Installation

1. **Clone or download the project**
   ```bash
   cd auth_dashboard_app
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Run the app**
   ```bash
   flutter run
   ```

## Project Structure

```
lib/
├── main.dart                 # Main app entry point
├── models/
│   └── user.dart            # User data model
├── providers/
│   └── auth_provider.dart   # Authentication state management
├── screens/
│   ├── login_screen.dart    # Login screen
│   └── dashboard_screen.dart # Main dashboard
├── services/
│   └── auth_service.dart    # Authentication service with fake API
└── widgets/
    ├── custom_text_field.dart # Reusable text field widget
    └── loading_screen.dart   # Loading screen widget
```

## How It Works

### Authentication Flow

1. **App Launch**: The app checks for existing authentication tokens
2. **Login Screen**: If not authenticated, shows the login form
3. **Fake API Call**: Simulates a 1-second API delay for realism
4. **Validation**: Checks credentials against pre-configured demo accounts
5. **Token Generation**: Creates a fake authentication token
6. **Local Storage**: Saves token and user data to SharedPreferences
7. **Navigation**: Automatically redirects to dashboard upon successful login

### Dashboard Features

- **Welcome Section**: Personalized greeting with user avatar
- **Quick Stats**: Four metric cards showing sample data
- **Recent Activity**: Sample activity feed
- **Navigation**: Bottom navigation with multiple sections
- **Profile Dialog**: User profile with logout option

## Dependencies

- `flutter`: Core Flutter framework
- `provider`: State management
- `http`: HTTP requests (for future real API integration)
- `shared_preferences`: Local data storage
- `cupertino_icons`: iOS-style icons

## Customization

### Adding Real API

To replace the fake API with a real one:

1. Update `auth_service.dart` with your actual API endpoints
2. Modify the `login` method to make real HTTP requests
3. Update error handling for real API responses
4. Replace fake token generation with real JWT handling

### Styling

The app uses a consistent color scheme defined in the theme:
- Primary: `#667eea` (Blue)
- Secondary: `#764ba2` (Purple)
- Text: `#2d3748` (Dark Gray)
- Background: `#f7fafc` (Light Gray)

### Adding New Screens

1. Create a new screen file in the `screens/` directory
2. Add it to the bottom navigation in `dashboard_screen.dart`
3. Update the `_buildDashboardContent` method to handle the new screen

## Troubleshooting

### Common Issues

1. **Dependencies not found**: Run `flutter pub get`
2. **Build errors**: Ensure Flutter SDK is up to date
3. **Emulator issues**: Check if emulator is running and accessible

### Debug Mode

The app runs in debug mode by default. For production builds:
```bash
flutter build apk --release  # Android
flutter build ios --release  # iOS
```

## Future Enhancements

- [ ] Real API integration
- [ ] User registration
- [ ] Password reset functionality
- [ ] Push notifications
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Biometric authentication

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the app.

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Note**: This is a demonstration app with fake authentication. Do not use in production without implementing proper security measures.
