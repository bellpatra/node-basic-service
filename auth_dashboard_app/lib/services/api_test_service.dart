import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class APITestService {
  // Test basic connectivity to your API
  static Future<Map<String, dynamic>> testAPIConnectivity() async {
    try {
      final response = await http.get(
        Uri.parse('${APIConfig.baseUrl}/health'),
        headers: APIConfig.defaultHeaders,
      ).timeout(const Duration(seconds: 10));

      return {
        'success': true,
        'statusCode': response.statusCode,
        'message': 'API connection successful',
        'response': response.body,
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'API connection failed: $e',
        'error': e.toString(),
      };
    }
  }

  // Test QR generation endpoint
  static Future<Map<String, dynamic>> testQRGeneration() async {
    try {
      final response = await http.post(
        Uri.parse('${APIConfig.fullBaseUrl}${APIConfig.qrGenerateEndpoint}'),
        headers: APIConfig.defaultHeaders,
        body: jsonEncode({
          'type': 'explanation',
          'customData': {
            'purpose': 'test',
            'description': 'Testing QR generation',
          },
        }),
      ).timeout(const Duration(seconds: 15));

      return {
        'success': true,
        'statusCode': response.statusCode,
        'message': 'QR generation test completed',
        'response': response.body,
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'QR generation test failed: $e',
        'error': e.toString(),
      };
    }
  }

  // Test QR verification endpoint
  static Future<Map<String, dynamic>> testQRVerification() async {
    try {
      final response = await http.post(
        Uri.parse('${APIConfig.fullBaseUrl}${APIConfig.qrVerifyEndpoint}'),
        headers: APIConfig.defaultHeaders,
        body: jsonEncode({
          'code': 'test_code_123',
          'ip': '127.0.0.1',
          'userAgent': 'Flutter-Test-App',
        }),
      ).timeout(const Duration(seconds: 15));

      return {
        'success': true,
        'statusCode': response.statusCode,
        'message': 'QR verification test completed',
        'response': response.body,
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'QR verification test failed: $e',
        'error': e.toString(),
      };
    }
  }

  // Get API status and endpoints
  static Future<Map<String, dynamic>> getAPIStatus() async {
    final results = {
      'baseUrl': APIConfig.baseUrl,
      'fullBaseUrl': APIConfig.fullBaseUrl,
      'endpoints': {
        'health': '${APIConfig.baseUrl}/health',
        'qrGenerate': '${APIConfig.fullBaseUrl}${APIConfig.qrGenerateEndpoint}',
        'qrVerify': '${APIConfig.fullBaseUrl}${APIConfig.qrVerifyEndpoint}',
        'qrStats': '${APIConfig.fullBaseUrl}${APIConfig.qrStatsEndpoint}',
      },
      'connectivity': await testAPIConnectivity(),
      'qrGeneration': await testQRGeneration(),
      'qrVerification': await testQRVerification(),
    };

    return results;
  }
}
