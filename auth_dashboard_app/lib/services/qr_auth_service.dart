import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/qr_auth_data.dart';
import '../config/api_config.dart';

class QRAuthService {
  // Real API endpoints for your hosted backend
  static String get _baseUrl => APIConfig.fullBaseUrl;
  static const String _qrAuthEndpoint = APIConfig.qrGenerateEndpoint;
  static const String _verifyEndpoint = APIConfig.qrVerifyEndpoint;
  
  // Generate a new QR code for authentication via real API
  Future<QRAuthData> generateQRAuth({
    required String type,
    String? userId,
    Map<String, dynamic>? customData,
  }) async {
    try {
      // Prepare request data
      final requestData = {
        'type': type,
        'userId': userId,
        'customData': customData ?? {},
        'expiryMinutes': _getExpiryMinutes(type),
      };

      // Make API call to your hosted backend
      final response = await http.post(
        Uri.parse('$_baseUrl$_qrAuthEndpoint'),
        headers: {
          ...APIConfig.defaultHeaders,
          // Add authorization header if you have a token
          // 'Authorization': 'Bearer $authToken',
        },
        body: jsonEncode(requestData),
      ).timeout(APIConfig.connectionTimeout);

      if (response.statusCode == 201 || response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        
        if (responseData['success'] == true) {
          // Parse the QR data from your API response
          return QRAuthData.fromJson(responseData['qrCode']);
        } else {
          throw Exception(responseData['message'] ?? 'Failed to generate QR code');
        }
      } else {
        // Handle different HTTP status codes
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['error'] ?? 'HTTP ${response.statusCode}: Failed to generate QR code');
      }
    } catch (e) {
      if (e is http.ClientException) {
        throw Exception(APIConfig.networkError);
              } else if (e.toString().contains('timeout')) {
          throw Exception(APIConfig.timeoutError);
        } else {
          throw Exception('QR generation failed: $e');
        }
    }
  }

  // Helper method to get expiry time based on QR type
  int _getExpiryMinutes(String type) {
    switch (type) {
      case 'api':
        return APIConfig.qrApiExpiryMinutes;
      case 'explanation':
        return APIConfig.qrExplanationExpiryHours * 60; // Convert hours to minutes
      case 'magic_link':
        return APIConfig.qrMagicLinkExpiryMinutes;
      default:
        return 5; // Default 5 minutes
    }
  }

  // These methods are no longer needed as we're using the real API
  // The API handles QR code generation on the backend

  // Verify QR code and authenticate user via real API
  Future<Map<String, dynamic>> verifyQRAuth(QRAuthData qrData) async {
    try {
      // Prepare verification request
      final requestData = {
        'code': qrData.code, // QR code identifier
        'ip': '127.0.0.1', // In real app, get actual IP
        'userAgent': 'Flutter-QR-Auth-App/1.0.0',
        'qrData': qrData.toJson(), // Full QR data for verification
      };

      // Make API call to your hosted backend
      final response = await http.post(
        Uri.parse('$_baseUrl$_verifyEndpoint'),
        headers: APIConfig.defaultHeaders,
        body: jsonEncode(requestData),
      ).timeout(APIConfig.connectionTimeout);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        
        if (responseData['success'] == true) {
          return {
            'success': true,
            'message': responseData['message'] ?? APIConfig.qrVerifiedSuccess,
            'user': responseData['user'],
            'token': responseData['token'],
            'method': responseData['method'] ?? 'qr_${qrData.type}',
          };
        } else {
          return {
            'success': false,
            'message': responseData['message'] ?? 'Verification failed',
            'error': responseData['error'] ?? 'verification_failed',
          };
        }
      } else {
        // Handle different HTTP status codes
        final errorData = jsonDecode(response.body);
        return {
          'success': false,
          'message': errorData['error'] ?? 'HTTP ${response.statusCode}: Verification failed',
          'error': 'http_error',
        };
      }
    } catch (e) {
      if (e is http.ClientException) {
        return {
          'success': false,
          'message': APIConfig.networkError,
          'error': 'network_error',
        };
              } else if (e.toString().contains('timeout')) {
          return {
            'success': false,
            'message': APIConfig.timeoutError,
            'error': 'timeout_error',
          };
        } else {
          return {
            'success': false,
            'message': 'Verification failed: $e',
            'error': 'verification_error',
          };
        }
    }
  }

    // These methods are no longer needed as we're using the real API
  // The API handles QR code verification on the backend

  // These helper methods are no longer needed as we're using the real API
  // The backend handles token generation, user management, etc.

  // Get QR code statistics from real API
  Future<Map<String, dynamic>> getQRAuthStats() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl${APIConfig.qrStatsEndpoint}'),
        headers: {
          ...APIConfig.defaultHeaders,
          // Add authorization header if you have a token
          // 'Authorization': 'Bearer $authToken',
        },
      ).timeout(APIConfig.connectionTimeout);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        
        if (responseData['success'] == true) {
          return {
            'totalGenerated': responseData['stats']['totalGenerated'] ?? 0,
            'successfulLogins': responseData['stats']['successfulLogins'] ?? 0,
            'failedAttempts': responseData['stats']['failedAttempts'] ?? 0,
            'averageResponseTime': responseData['stats']['averageResponseTime'] ?? 'N/A',
            'lastGenerated': responseData['recentCodes']?.isNotEmpty == true 
                ? responseData['recentCodes'][0]['createdAt'] 
                : DateTime.now().toIso8601String(),
            'recentCodes': responseData['recentCodes'] ?? [],
          };
        } else {
          throw Exception(responseData['message'] ?? 'Failed to get statistics');
        }
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['error'] ?? 'HTTP ${response.statusCode}: Failed to get statistics');
      }
    } catch (e) {
      if (e is http.ClientException) {
        throw Exception(APIConfig.networkError);
      } else if (e.toString().contains('timeout')) {
        throw Exception(APIConfig.timeoutError);
      } else {
        throw Exception('Failed to get QR statistics: $e');
      }
    }
  }
}
