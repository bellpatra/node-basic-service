class APIConfig {
  // Base API URL - your hosted backend
  static const String baseUrl = 'http://devapi.asmirti.com';
  
  // API Version
  static const String apiVersion = '/api/v1';
  
  // Full API base URL
  static String get fullBaseUrl => '$baseUrl$apiVersion';
  
  // Authentication endpoints
  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  static const String logoutEndpoint = '/auth/logout';
  static const String refreshTokenEndpoint = '/auth/refresh';
  
  // QR Code endpoints
  static const String qrGenerateEndpoint = '/qr/generate';
  static const String qrVerifyEndpoint = '/qr/verify';
  static const String qrStatsEndpoint = '/qr/stats';
  static const String qrMyCodesEndpoint = '/qr/my-codes';
  static const String qrDeactivateEndpoint = '/qr'; // /qr/{code}/deactivate
  
  // User endpoints
  static const String userProfileEndpoint = '/users/profile';
  static const String userUpdateEndpoint = '/users/profile';
  
  // Headers
  static Map<String, String> get defaultHeaders => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Flutter-QR-Auth-App/1.0.0',
  };
  
  // Timeout settings
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // QR Code settings
  static const int qrApiExpiryMinutes = 5;
  static const int qrExplanationExpiryHours = 24;
  static const int qrMagicLinkExpiryMinutes = 10;
  
  // Error messages
  static const String networkError = 'Network error. Please check your connection.';
  static const String serverError = 'Server error. Please try again later.';
  static const String timeoutError = 'Request timeout. Please try again.';
  static const String unauthorizedError = 'Unauthorized. Please login again.';
  
  // Success messages
  static const String qrGeneratedSuccess = 'QR code generated successfully!';
  static const String qrVerifiedSuccess = 'QR code verified successfully!';
  static const String loginSuccess = 'Login successful!';
}
