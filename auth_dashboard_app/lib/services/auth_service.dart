import 'dart:convert';
import 'dart:math';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';

class AuthService {
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';

  // Fake user credentials for demo
  static const Map<String, Map<String, String>> _fakeUsers = {
    'user@example.com': {
      'password': 'password123',
      'name': 'John Doe',
      'id': '1',
    },
    'admin@example.com': {
      'password': 'admin123',
      'name': 'Admin User',
      'id': '2',
    },
    'test@example.com': {
      'password': 'test123',
      'name': 'Test User',
      'id': '3',
    },
  };

  Future<Map<String, dynamic>> login(String email, String password) async {
    // Simulate API delay
    await Future.delayed(const Duration(seconds: 1));

    // Check if user exists and password matches
    if (_fakeUsers.containsKey(email) && 
        _fakeUsers[email]!['password'] == password) {
      
      final userData = _fakeUsers[email]!;
      final user = User(
        id: userData['id']!,
        email: email,
        name: userData['name']!,
        avatar: 'https://i.pravatar.cc/150?u=${userData['id']}',
      );

      // Generate fake token
      final token = _generateToken();
      
      // Store token and user data
      await _storeAuthData(token, user);

      return {
        'success': true,
        'token': token,
        'user': user,
        'message': 'Login successful',
      };
    } else {
      return {
        'success': false,
        'message': 'Invalid email or password',
      };
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }

  Future<bool> isAuthenticated() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    return token != null && token.isNotEmpty;
  }

  Future<User?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(_userKey);
    if (userJson != null) {
      return User.fromJson(jsonDecode(userJson));
    }
    return null;
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  Future<void> _storeAuthData(String token, User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  String _generateToken() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    final random = Random();
    return String.fromCharCodes(
      Iterable.generate(32, (_) => chars.codeUnitAt(random.nextInt(chars.length)))
    );
  }

  // Simulate API call to get user profile
  Future<User?> getUserProfile() async {
    try {
      final token = await getToken();
      if (token == null) return null;

      // Simulate API delay
      await Future.delayed(const Duration(milliseconds: 500));

      final currentUser = await getCurrentUser();
      if (currentUser != null) {
        // Simulate getting additional profile data
        return User(
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.name,
          avatar: currentUser.avatar,
        );
      }
      return null;
    } catch (e) {
      // Error getting user profile: $e
      return null;
    }
  }
}
