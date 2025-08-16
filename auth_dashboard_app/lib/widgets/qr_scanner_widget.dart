import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'dart:convert';
import '../models/qr_auth_data.dart';

class QRScannerWidget extends StatefulWidget {
  final Function(QRAuthData) onQRCodeScanned;
  final VoidCallback? onError;
  final String? title;

  const QRScannerWidget({
    super.key,
    required this.onQRCodeScanned,
    this.onError,
    this.title,
  });

  @override
  State<QRScannerWidget> createState() => _QRScannerWidgetState();
}

class _QRScannerWidgetState extends State<QRScannerWidget> {
  MobileScannerController? _scannerController;
  bool _isScanning = true;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _scannerController = MobileScannerController(
      detectionSpeed: DetectionSpeed.normal,
      facing: CameraFacing.back,
      torchEnabled: false,
    );
  }

  @override
  void dispose() {
    _scannerController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title ?? 'Scan QR Code'),
        backgroundColor: const Color(0xFF667eea),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: Icon(_isScanning ? Icons.pause : Icons.play_arrow),
            onPressed: _toggleScanning,
          ),
          IconButton(
            icon: const Icon(Icons.flash_on),
            onPressed: _toggleTorch,
          ),
          IconButton(
            icon: const Icon(Icons.image),
            onPressed: _pickImageFromGallery,
          ),
        ],
      ),
      body: Stack(
        children: [
          // QR Scanner
          MobileScanner(
            controller: _scannerController,
            onDetect: _onQRCodeDetected,
          ),
          
          // Overlay UI
          _buildOverlay(),
          
          // Processing indicator
          if (_isProcessing)
            Container(
              color: Colors.black54,
              child: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                    SizedBox(height: 16),
                    Text(
                      'Processing QR Code...',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildOverlay() {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(
          color: Colors.white,
          width: 2,
        ),
      ),
      child: Stack(
        children: [
          // Corner indicators
          Positioned(
            top: 0,
            left: 0,
            child: Container(
              width: 50,
              height: 50,
              decoration: const BoxDecoration(
                border: Border(
                  top: BorderSide(color: Color(0xFF667eea), width: 4),
                  left: BorderSide(color: Color(0xFF667eea), width: 4),
                ),
              ),
            ),
          ),
          Positioned(
            top: 0,
            right: 0,
            child: Container(
              width: 50,
              height: 50,
              decoration: const BoxDecoration(
                border: Border(
                  top: BorderSide(color: Color(0xFF667eea), width: 4),
                  right: BorderSide(color: Color(0xFF667eea), width: 4),
                ),
              ),
            ),
          ),
          Positioned(
            bottom: 0,
            left: 0,
            child: Container(
              width: 50,
              height: 50,
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: Color(0xFF667eea), width: 4),
                  left: BorderSide(color: Color(0xFF667eea), width: 4),
                ),
              ),
            ),
          ),
          Positioned(
            bottom: 0,
            right: 0,
            child: Container(
              width: 50,
              height: 50,
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: Color(0xFF667eea), width: 4),
                  right: BorderSide(color: Color(0xFF667eea), width: 4),
                ),
              ),
            ),
          ),
          
          // Instructions
          Positioned(
            bottom: 100,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              margin: const EdgeInsets.symmetric(horizontal: 40),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'Position the QR code within the frame to scan',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _toggleScanning() {
    setState(() {
      _isScanning = !_isScanning;
    });
    
    if (_isScanning) {
      _scannerController?.start();
    } else {
      _scannerController?.stop();
    }
  }

  void _toggleTorch() {
    _scannerController?.toggleTorch();
  }

  Future<void> _pickImageFromGallery() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1024,
        maxHeight: 1024,
      );

      if (image != null) {
        await _processImageFile(File(image.path));
      }
    } catch (e) {
      _showError('Failed to pick image: $e');
    }
  }

  Future<void> _processImageFile(File imageFile) async {
    setState(() {
      _isProcessing = true;
    });

    try {
      // In a real app, you would use a QR code decoder library
      // For demo purposes, we'll simulate processing
      await Future.delayed(const Duration(seconds: 2));
      
      // Simulate finding a QR code
      final qrData = QRAuthData.explanationBased(
        explanation: 'QR code scanned from gallery image',
        action: 'login',
        metadata: {
          'source': 'gallery',
          'timestamp': DateTime.now().toIso8601String(),
        },
      );
      
      widget.onQRCodeScanned(qrData);
    } catch (e) {
      _showError('Failed to process image: $e');
    } finally {
      setState(() {
        _isProcessing = false;
      });
    }
  }

  void _onQRCodeDetected(BarcodeCapture capture) {
    if (_isProcessing) return;

    final List<Barcode> barcodes = capture.barcodes;
    
    for (final barcode in barcodes) {
      if (barcode.rawValue != null) {
        _processQRCode(barcode.rawValue!);
        break;
      }
    }
  }

  void _processQRCode(String qrData) {
    setState(() {
      _isProcessing = true;
    });

    try {
      // Parse QR code data
      final qrAuthData = _parseQRCodeData(qrData);
      
      // Call the callback
      widget.onQRCodeScanned(qrAuthData);
    } catch (e) {
      _showError('Invalid QR code: $e');
    } finally {
      setState(() {
        _isProcessing = false;
      });
    }
  }

  QRAuthData _parseQRCodeData(String qrData) {
    try {
      // Try to parse as JSON first
      final jsonData = jsonDecode(qrData);
      return QRAuthData.fromJson(jsonData);
    } catch (e) {
      // If not JSON, treat as explanation-based
      return QRAuthData.explanationBased(
        explanation: qrData,
        action: 'login',
        metadata: {
          'source': 'scanner',
          'timestamp': DateTime.now().toIso8601String(),
        },
      );
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
    
    widget.onError?.call();
  }
}
