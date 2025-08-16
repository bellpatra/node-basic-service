# 📱 Flutter Integration Guide for QR Authentication

This guide explains how to integrate the QR authentication system with your Flutter mobile app to create a WhatsApp-like authentication experience.

## 🎯 Overview testing

The system provides:
- **Real-time QR code generation** with auto-refresh every 5 seconds
- **Instant authentication** when QR codes are scanned
- **WebSocket support** for real-time updates
- **Secure JWT token generation** for authenticated sessions

## 🚀 Quick Start

### 1. Add Dependencies

Add these packages to your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  qr_flutter: ^4.1.0
  qr_code_scanner: ^1.0.1
  socket_io_client: ^2.0.3+1
  shared_preferences: ^2.2.2
  provider: ^6.1.1
```

### 2. Basic QR Code Scanner Implementation

```dart
import 'package:flutter/material.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class QRScannerScreen extends StatefulWidget {
  @override
  _QRScannerScreenState createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  QRViewController? controller;
  bool isScanning = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Scan QR Code'),
        backgroundColor: Colors.green,
      ),
      body: QRView(
        key: qrKey,
        onQRViewCreated: _onQRViewCreated,
        overlay: QrScannerOverlayShape(
          borderColor: Colors.green,
          borderRadius: 10,
          borderLength: 30,
          borderWidth: 10,
          cutOutSize: 300,
        ),
      ),
    );
  }

  void _onQRViewCreated(QRViewController controller) {
    this.controller = controller;
    controller.scannedDataStream.listen((scanData) {
      if (isScanning && scanData.code != null) {
        _handleQRCode(scanData.code!);
      }
    });
  }

  void _handleQRCode(String qrData) async {
    setState(() {
      isScanning = false;
    });

    try {
      // Parse QR code data
      final Map<String, dynamic> qrInfo = json.decode(qrData);
      
      // Show loading dialog
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => Center(
          child: CircularProgressIndicator(),
        ),
      );

      // Authenticate user via QR code
      final response = await http.post(
        Uri.parse('http://your-api-domain:3000/api/qr/verify-session'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'sessionId': qrInfo['sessionId'],
          'userId': 'USER_ID_HERE', // Get from your app's user session
        }),
      );

      Navigator.pop(context); // Close loading dialog

      if (response.statusCode == 200) {
        final result = json.decode(response.body);
        
        // Store authentication token
        await _storeAuthToken(result['data']['token']);
        
        // Show success and navigate
        _showSuccessAndNavigate(result['data']['user']);
      } else {
        _showError('Authentication failed');
      }
    } catch (e) {
      Navigator.pop(context); // Close loading dialog
      _showError('Error: $e');
    }
  }

  Future<void> _storeAuthToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  void _showSuccessAndNavigate(Map<String, dynamic> user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Login Successful!'),
        content: Text('Welcome back, ${user['username']}!'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushReplacementNamed(context, '/home');
            },
            child: Text('Continue'),
          ),
        ],
      ),
    );
  }

  void _showError(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                isScanning = true;
              });
            },
            child: Text('Try Again'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    controller?.dispose();
    super.dispose();
  }
}
```

### 3. QR Code Generation for Other Users

```dart
class QRGeneratorScreen extends StatefulWidget {
  @override
  _QRGeneratorScreenState createState() => _QRGeneratorScreenState();
}

class _QRGeneratorScreenState extends State<QRGeneratorScreen> {
  String? qrImageData;
  String? sessionId;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _generateQRCode();
  }

  Future<void> _generateQRCode() async {
    try {
      final response = await http.get(
        Uri.parse('http://your-api-domain:3000/api/qr/session'),
      );

      if (response.statusCode == 200) {
        final result = json.decode(response.body);
        setState(() {
          qrImageData = result['data']['qrCode'];
          sessionId = result['data']['sessionId'];
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error generating QR code: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Your QR Code'),
        backgroundColor: Colors.green,
      ),
      body: Center(
        child: isLoading
            ? CircularProgressIndicator()
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (qrImageData != null)
                    Image.network(
                      qrImageData!,
                      width: 250,
                      height: 250,
                    ),
                  SizedBox(height: 20),
                  Text(
                    'Share this QR code with others to let them log in',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16),
                  ),
                  SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _generateQRCode,
                    child: Text('Refresh QR Code'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
```

### 4. WebSocket Integration for Real-time Updates

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class WebSocketService {
  late IO.Socket socket;
  
  void connect() {
    socket = IO.io('http://your-api-domain:3000', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    socket.onConnect((_) {
      print('Connected to WebSocket');
    });

    socket.onDisconnect((_) {
      print('Disconnected from WebSocket');
    });

    socket.on('qr-authenticated', (data) {
      print('QR authenticated: $data');
      // Handle successful authentication
      _handleQRAuthentication(data);
    });

    socket.connect();
  }

  void _handleQRAuthentication(Map<String, dynamic> data) {
    // Navigate to success screen or update UI
    // This will be called when someone scans your QR code
  }

  void disconnect() {
    socket.disconnect();
  }
}
```

### 5. Authentication Service

```dart
class AuthService {
  static const String baseUrl = 'http://your-api-domain:3000';
  
  static Future<Map<String, dynamic>> loginWithQR(String sessionId, String userId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/qr/verify-session'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'sessionId': sessionId,
          'userId': userId,
        }),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Authentication failed');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  static Future<Map<String, dynamic>> generateQRCode() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/qr/session'),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to generate QR code');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }
}
```

## 🔧 Configuration

### 1. Update API Base URL

Replace `your-api-domain:3000` with your actual API server URL in all the code examples above.

### 2. Android Permissions

Add camera permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" />
<uses-feature android:name="android.hardware.camera.autofocus" />
```

### 3. iOS Permissions

Add camera permissions to `ios/Runner/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to scan QR codes</string>
```

## 📱 Complete App Flow

### 1. User opens app
### 2. App generates QR code via `/api/qr/session`
### 3. QR code auto-refreshes every 5 seconds
### 4. Another user scans the QR code
### 5. Scanner app calls `/api/qr/verify-session`
### 6. WebSocket event `qr-authenticated` is emitted
### 7. Original app receives event and shows success
### 8. User is automatically logged in

## 🎨 UI/UX Recommendations

### 1. Loading States
- Show loading spinner while generating QR codes
- Display progress indicators during authentication
- Use skeleton screens for better perceived performance

### 2. Error Handling
- Graceful fallbacks for network errors
- User-friendly error messages
- Retry mechanisms for failed operations

### 3. Visual Feedback
- Success animations when QR is scanned
- Haptic feedback for important actions
- Smooth transitions between states

## 🔒 Security Considerations

### 1. Token Storage
- Store JWT tokens securely using `flutter_secure_storage`
- Implement token refresh mechanisms
- Clear tokens on app logout

### 2. Network Security
- Use HTTPS in production
- Implement certificate pinning
- Validate server responses

### 3. User Privacy
- Only request necessary permissions
- Clear sensitive data when appropriate
- Implement proper logout functionality

## 🚀 Building APK

### 1. Build Release APK

```bash
# Generate release APK
flutter build apk --release

# Generate split APKs for different architectures
flutter build apk --split-per-abi --release
```

### 2. Build App Bundle (Recommended for Play Store)

```bash
flutter build appbundle --release
```

### 3. Sign APK (Required for release)

```bash
# Generate keystore (if you don't have one)
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/upload-keystore.jks app-release-unsigned.apk upload
```

## 📋 Testing Checklist

- [ ] QR code generation works
- [ ] QR code scanning works
- [ ] Authentication flow completes successfully
- [ ] WebSocket events are received
- [ ] Error handling works properly
- [ ] UI updates correctly
- [ ] App works offline/online
- [ ] Permissions are requested properly
- [ ] APK builds successfully
- [ ] App runs on different devices

## 🆘 Troubleshooting

### Common Issues:

1. **Camera not working**: Check permissions in manifest files
2. **QR code not scanning**: Ensure proper lighting and focus
3. **WebSocket connection failed**: Check server URL and network
4. **Build errors**: Verify all dependencies are added
5. **Permission denied**: Check runtime permissions

### Debug Tips:

- Use `flutter doctor` to check environment
- Enable verbose logging in development
- Test on physical devices (camera doesn't work in emulator)
- Check network connectivity and firewall settings

## 📚 Additional Resources

- [Flutter Documentation](https://flutter.dev/docs)
- [QR Flutter Package](https://pub.dev/packages/qr_flutter)
- [HTTP Package](https://pub.dev/packages/http)
- [Socket.IO Client](https://pub.dev/packages/socket_io_client)

---

**Happy Coding! 🎉**

Your Flutter app is now ready to provide a WhatsApp-like QR authentication experience!
