import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../models/qr_auth_data.dart';
import '../services/qr_auth_service.dart';

class QRGeneratorWidget extends StatefulWidget {
  final Function(QRAuthData)? onQRGenerated;
  final String? title;

  const QRGeneratorWidget({
    super.key,
    this.onQRGenerated,
    this.title,
  });

  @override
  State<QRGeneratorWidget> createState() => _QRGeneratorWidgetState();
}

class _QRGeneratorWidgetState extends State<QRGeneratorWidget> {
  final QRAuthService _qrAuthService = QRAuthService();
  
  QRAuthData? _currentQRData;
  String _selectedType = 'api';
  bool _isGenerating = false;
  bool _showQR = false;
  
  final Map<String, String> _qrTypes = {
    'api': 'API-Based Authentication',
    'explanation': 'Explanation-Based Authentication',
    'magic_link': 'Magic Link Authentication',
  };

  final Map<String, String> _qrDescriptions = {
    'api': 'Generate a QR code that contains API endpoints and authentication tokens for secure login.',
    'explanation': 'Create a QR code with explanatory text that guides users through the authentication process.',
    'magic_link': 'Generate a QR code with a magic link that provides one-click authentication.',
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title ?? 'Generate QR Code'),
        backgroundColor: const Color(0xFF667eea),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // QR Type Selection
            _buildTypeSelection(),
            const SizedBox(height: 24),
            
            // Generate Button
            _buildGenerateButton(),
            const SizedBox(height: 24),
            
            // QR Code Display
            if (_showQR && _currentQRData != null) _buildQRDisplay(),
            
            // QR Code Details
            if (_currentQRData != null) _buildQRDetails(),
            
            // Usage Instructions
            if (_currentQRData != null) _buildUsageInstructions(),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeSelection() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select QR Code Type',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF2d3748),
              ),
            ),
            const SizedBox(height: 16),
            
            ..._qrTypes.entries.map((entry) => _buildTypeOption(entry.key, entry.value)),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeOption(String type, String title) {
    final isSelected = _selectedType == type;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        border: Border.all(
          color: isSelected ? const Color(0xFF667eea) : const Color(0xFFe2e8f0),
          width: isSelected ? 2 : 1,
        ),
        borderRadius: BorderRadius.circular(8),
        color: isSelected ? const Color(0xFFf0f4ff) : Colors.white,
      ),
      child: RadioListTile<String>(
        value: type,
        groupValue: _selectedType,
        onChanged: (value) {
          setState(() {
            _selectedType = value!;
            _showQR = false;
            _currentQRData = null;
          });
        },
        title: Text(
          title,
          style: TextStyle(
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            color: isSelected ? const Color(0xFF667eea) : const Color(0xFF2d3748),
          ),
        ),
        subtitle: Text(
          _qrDescriptions[type]!,
          style: TextStyle(
            color: isSelected ? const Color(0xFF667eea) : const Color(0xFF718096),
            fontSize: 14,
          ),
        ),
        activeColor: const Color(0xFF667eea),
        contentPadding: const EdgeInsets.symmetric(horizontal: 8),
      ),
    );
  }

  Widget _buildGenerateButton() {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: _isGenerating ? null : _generateQRCode,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF667eea),
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 4,
        ),
        child: _isGenerating
            ? const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  ),
                  SizedBox(width: 12),
                  Text('Generating...'),
                ],
              )
            : const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.qr_code, size: 24),
                  SizedBox(width: 8),
                  Text(
                    'Generate QR Code',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildQRDisplay() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const Text(
              'Your QR Code',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Color(0xFF2d3748),
              ),
            ),
            const SizedBox(height: 20),
            
            // QR Code
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFe2e8f0)),
              ),
              child: QrImageView(
                data: _currentQRData!.qrString,
                version: QrVersions.auto,
                size: 200,
                backgroundColor: Colors.white,
                foregroundColor: const Color(0xFF2d3748),
                errorCorrectionLevel: QrErrorCorrectLevel.M,
              ),
            ),
            const SizedBox(height: 20),
            
            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _downloadQRCode,
                    icon: const Icon(Icons.download),
                    label: const Text('Download'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF48bb78),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _shareQRCode,
                    icon: const Icon(Icons.share),
                    label: const Text('Share'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFed8936),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQRDetails() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'QR Code Details',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF2d3748),
              ),
            ),
            const SizedBox(height: 16),
            
            _buildDetailRow('Type', _currentQRData!.type.toUpperCase()),
            _buildDetailRow('Data', _currentQRData!.data),
            _buildDetailRow('Expires', _formatExpiry()),
            if (_currentQRData!.metadata != null) ...[
              _buildDetailRow('Generated', _formatTimestamp()),
              ..._currentQRData!.metadata!.entries.map((entry) => 
                _buildDetailRow(entry.key, entry.value.toString())
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: Color(0xFF4a5568),
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                color: Color(0xFF2d3748),
                fontFamily: 'monospace',
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUsageInstructions() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'How to Use',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF2d3748),
              ),
            ),
            const SizedBox(height: 16),
            
            _buildInstructionStep(1, 'Share this QR code with the user who needs to authenticate'),
            _buildInstructionStep(2, 'User scans the QR code using their mobile device'),
            _buildInstructionStep(3, 'The app processes the QR code and authenticates the user'),
            _buildInstructionStep(4, 'User is automatically logged in and redirected to the dashboard'),
            
            const SizedBox(height: 16),
            
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFf0f4ff),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFc6f6d5)),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.info_outline,
                    color: Color(0xFF667eea),
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'This QR code will expire in ${_getExpiryTime()}',
                      style: const TextStyle(
                        color: Color(0xFF667eea),
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInstructionStep(int step, String instruction) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: const Color(0xFF667eea),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                step.toString(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              instruction,
              style: const TextStyle(
                color: Color(0xFF4a5568),
                fontSize: 16,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _generateQRCode() async {
    setState(() {
      _isGenerating = true;
    });

    try {
      final qrData = await _qrAuthService.generateQRAuth(
        type: _selectedType,
        customData: {
          'generatedBy': 'admin',
          'purpose': 'authentication',
        },
      );

      setState(() {
        _currentQRData = qrData;
        _showQR = true;
      });

      widget.onQRGenerated?.call(qrData);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('QR code generated successfully!'),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to generate QR code: $e'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } finally {
      setState(() {
        _isGenerating = false;
      });
    }
  }

  void _downloadQRCode() {
    // In a real app, you would implement actual download functionality
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Download functionality coming soon!'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _shareQRCode() {
    // In a real app, you would implement actual sharing functionality
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Share functionality coming soon!'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  String _formatExpiry() {
    if (_currentQRData!.expiry == null) return 'Never';
    return _currentQRData!.expiry!.toLocal().toString().split('.')[0];
  }

  String _formatTimestamp() {
    return DateTime.now().toLocal().toString().split('.')[0];
  }

  String _getExpiryTime() {
    if (_currentQRData!.expiry == null) return 'never';
    
    final now = DateTime.now();
    final expiry = _currentQRData!.expiry!;
    final difference = expiry.difference(now);
    
    if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minutes';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hours';
    } else {
      return '${difference.inDays} days';
    }
  }
}
