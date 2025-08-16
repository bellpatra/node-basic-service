import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/qr_auth_service.dart';
import '../models/qr_auth_data.dart';
import '../widgets/qr_scanner_widget.dart';
import '../widgets/qr_generator_widget.dart';
import '../widgets/custom_text_field.dart';

class QRLoginScreen extends StatefulWidget {
  const QRLoginScreen({super.key});

  @override
  State<QRLoginScreen> createState() => _QRLoginScreenState();
}

class _QRLoginScreenState extends State<QRLoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final QRAuthService _qrAuthService = QRAuthService();
  
  bool _obscurePassword = true;
  bool _isLoading = false;
  String? _errorMessage;
  String _selectedMethod = 'qr'; // 'qr' or 'traditional'
  
  // QR Code related
  QRAuthData? _scannedQRData;
  bool _showQRScanner = false;
  bool _showQRGenerator = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF667eea),
              Color(0xFF764ba2),
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                // App Logo/Icon
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(
                    Icons.qr_code_scanner,
                    size: 40,
                    color: Color(0xFF667eea),
                  ),
                ),
                const SizedBox(height: 24),
                
                // Title
                const Text(
                  'QR Code Login',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                
                // Subtitle
                const Text(
                  'Choose your preferred login method',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white70,
                  ),
                ),
                const SizedBox(height: 32),

                // Login Method Selection
                _buildMethodSelection(),
                const SizedBox(height: 24),

                // Content based on selected method
                if (_selectedMethod == 'qr') _buildQRLoginContent(),
                if (_selectedMethod == 'traditional') _buildTraditionalLoginContent(),

                // Error Message
                if (_errorMessage != null) _buildErrorMessage(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMethodSelection() {
    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const Text(
              'Login Method',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF2d3748),
              ),
            ),
            const SizedBox(height: 20),
            
            Row(
              children: [
                Expanded(
                  child: _buildMethodOption(
                    'qr',
                    'QR Code',
                    Icons.qr_code_scanner,
                    'Scan or generate QR codes for instant login',
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildMethodOption(
                    'traditional',
                    'Traditional',
                    Icons.email,
                    'Use email and password to login',
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMethodOption(String method, String title, IconData icon, String description) {
    final isSelected = _selectedMethod == method;
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedMethod = method;
          _errorMessage = null;
          _scannedQRData = null;
          _showQRScanner = false;
          _showQRGenerator = false;
        });
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected ? const Color(0xFF667eea) : const Color(0xFFe2e8f0),
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
          color: isSelected ? const Color(0xFFf0f4ff) : Colors.white,
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 32,
              color: isSelected ? const Color(0xFF667eea) : const Color(0xFF718096),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isSelected ? const Color(0xFF667eea) : const Color(0xFF2d3748),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              description,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: isSelected ? const Color(0xFF667eea) : const Color(0xFF718096),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQRLoginContent() {
    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const Text(
              'QR Code Authentication',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Color(0xFF2d3748),
              ),
            ),
            const SizedBox(height: 20),
            
            // QR Code Actions
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      setState(() {
                        _showQRScanner = true;
                        _showQRGenerator = false;
                      });
                    },
                    icon: const Icon(Icons.qr_code_scanner),
                    label: const Text('Scan QR Code'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF48bb78),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      setState(() {
                        _showQRGenerator = true;
                        _showQRScanner = false;
                      });
                    },
                    icon: const Icon(Icons.qr_code),
                    label: const Text('Generate QR'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFed8936),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            
            // Scanned QR Info
            if (_scannedQRData != null) _buildScannedQRInfo(),
            
            // Instructions
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFf7fafc),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFe2e8f0)),
              ),
              child: Column(
                children: [
                  const Text(
                    'How QR Code Login Works:',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF4a5568),
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildInstructionStep(1, 'Scan a QR code or generate one for others'),
                  _buildInstructionStep(2, 'The QR code contains authentication data'),
                  _buildInstructionStep(3, 'App verifies the QR code and logs you in'),
                  _buildInstructionStep(4, 'Access your dashboard instantly'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTraditionalLoginContent() {
    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              const Text(
                'Traditional Login',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2d3748),
                ),
              ),
              const SizedBox(height: 24),

              // Email Field
              CustomTextField(
                controller: _emailController,
                labelText: 'Email',
                hintText: 'Enter your email',
                prefixIcon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your email';
                  }
                  if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                    return 'Please enter a valid email';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),

              // Password Field
              CustomTextField(
                controller: _passwordController,
                labelText: 'Password',
                hintText: 'Enter your password',
                prefixIcon: Icons.lock_outlined,
                obscureText: _obscurePassword,
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscurePassword ? Icons.visibility : Icons.visibility_off,
                    color: const Color(0xFF718096),
                  ),
                  onPressed: () {
                    setState(() {
                      _obscurePassword = !_obscurePassword;
                    });
                  },
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your password';
                  }
                  if (value.length < 6) {
                    return 'Password must be at least 6 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),

              // Demo Credentials Info
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFf7fafc),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFe2e8f0)),
                ),
                child: Column(
                  children: [
                    const Text(
                      'Demo Credentials:',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF4a5568),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'user@example.com / password123\nadmin@example.com / admin123\ntest@example.com / test123',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12,
                        color: Color(0xFF718096),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Login Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleTraditionalLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF667eea),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    elevation: 2,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text(
                          'Sign In',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildScannedQRInfo() {
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: const Color(0xFFf0f4ff),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFc6f6d5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.qr_code,
                color: Color(0xFF667eea),
                size: 20,
              ),
              const SizedBox(width: 8),
              const Text(
                'QR Code Scanned',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF667eea),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Type: ${_scannedQRData!.type.toUpperCase()}',
            style: const TextStyle(color: Color(0xFF4a5568)),
          ),
          Text(
            'Data: ${_scannedQRData!.data}',
            style: const TextStyle(color: Color(0xFF4a5568)),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _handleQRLogin,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF48bb78),
                foregroundColor: Colors.white,
              ),
              child: const Text('Login with QR Code'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInstructionStep(int step, String instruction) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              color: const Color(0xFF667eea),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Text(
                step.toString(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              instruction,
              style: const TextStyle(
                color: Color(0xFF4a5568),
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorMessage() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      margin: const EdgeInsets.only(top: 16),
      decoration: BoxDecoration(
        color: const Color(0xFFfed7d7),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFfeb2b2)),
      ),
      child: Text(
        _errorMessage!,
        style: const TextStyle(
          color: Color(0xFFc53030),
          fontSize: 14,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }

  void _handleTraditionalLogin() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      try {
        final authProvider = context.read<AuthProvider>();
        final success = await authProvider.login(
          _emailController.text.trim(),
          _passwordController.text,
        );

        if (success && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Login successful!'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } catch (e) {
        setState(() {
          _errorMessage = 'Login failed: $e';
        });
      } finally {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _handleQRLogin() async {
    if (_scannedQRData == null) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final result = await _qrAuthService.verifyQRAuth(_scannedQRData!);
      
      if (result['success']) {
        final authProvider = context.read<AuthProvider>();
        await authProvider.login(
          result['user']['email'],
          'qr_auth_${DateTime.now().millisecondsSinceEpoch}',
        );
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result['message']),
              backgroundColor: Colors.green,
            ),
          );
        }
      } else {
        setState(() {
          _errorMessage = result['message'];
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'QR authentication failed: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _onQRCodeScanned(QRAuthData qrData) {
    setState(() {
      _scannedQRData = qrData;
      _showQRScanner = false;
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('QR code scanned: ${qrData.type}'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _onQRCodeGenerated(QRAuthData qrData) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('QR code generated: ${qrData.type}'),
        backgroundColor: Colors.blue,
      ),
    );
  }
}

// Navigation helpers
void navigateToQRScanner(BuildContext context, Function(QRAuthData) onQRCodeScanned) {
  Navigator.push(
    context,
    MaterialPageRoute(
      builder: (context) => QRScannerWidget(
        onQRCodeScanned: onQRCodeScanned,
        title: 'Scan QR Code',
      ),
    ),
  );
}

void navigateToQRGenerator(BuildContext context, Function(QRAuthData)? onQRGenerated) {
  Navigator.push(
    context,
    MaterialPageRoute(
      builder: (context) => QRGeneratorWidget(
        onQRGenerated: onQRGenerated,
        title: 'Generate QR Code',
      ),
    ),
  );
}
