class QRAuthData {
  final String? code; // Unique identifier for the QR code
  final String type; // 'api', 'explanation', 'magic_link'
  final String data;
  final DateTime? expiry;
  final Map<String, dynamic>? metadata;

  QRAuthData({
    this.code,
    required this.type,
    required this.data,
    this.expiry,
    this.metadata,
  });

  factory QRAuthData.fromJson(Map<String, dynamic> json) {
    return QRAuthData(
      code: json['code'],
      type: json['type'] ?? 'api',
      data: json['data'] ?? '',
      expiry: json['expiry'] != null 
          ? DateTime.parse(json['expiry']) 
          : null,
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'code': code,
      'type': type,
      'data': data,
      'expiry': expiry?.toIso8601String(),
      'metadata': metadata,
    };
  }

  bool get isExpired {
    if (expiry == null) return false;
    return DateTime.now().isAfter(expiry!);
  }

  // Generate QR code data string
  String get qrString {
    return toJson().toString();
  }

  // Create API-based QR data
  factory QRAuthData.apiBased({
    String? code,
    required String endpoint,
    required String token,
    required String userId,
    DateTime? expiry,
  }) {
    return QRAuthData(
      code: code,
      type: 'api',
      data: '$endpoint|$token|$userId',
      expiry: expiry ?? DateTime.now().add(const Duration(minutes: 5)),
      metadata: {
        'endpoint': endpoint,
        'token': token,
        'userId': userId,
      },
    );
  }

  // Create explanation-based QR data
  factory QRAuthData.explanationBased({
    String? code,
    required String explanation,
    required String action,
    Map<String, dynamic>? metadata,
  }) {
    return QRAuthData(
      code: code,
      type: 'explanation',
      data: explanation,
      expiry: DateTime.now().add(const Duration(hours: 24)),
      metadata: {
        'action': action,
        ...?metadata,
      },
    );
  }

  // Create magic link QR data
  factory QRAuthData.magicLink({
    String? code,
    required String url,
    required String token,
    DateTime? expiry,
  }) {
    return QRAuthData(
      code: code,
      type: 'magic_link',
      data: url,
      expiry: expiry ?? DateTime.now().add(const Duration(minutes: 10)),
      metadata: {
        'token': token,
        'url': url,
      },
    );
  }
}
