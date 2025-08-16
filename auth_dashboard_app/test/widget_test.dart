// This is a basic Flutter widget test for the Auth Dashboard App.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:auth_dashboard_app/main.dart';
import 'package:auth_dashboard_app/providers/auth_provider.dart';

void main() {
  testWidgets('App shows login screen initially', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Verify that the login screen is shown initially
    expect(find.text('Welcome Back'), findsOneWidget);
    expect(find.text('Sign in to your account'), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
    expect(find.text('Sign In'), findsOneWidget);
  });

  testWidgets('Login form validation works', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Try to submit empty form
    await tester.tap(find.text('Sign In'));
    await tester.pump();

    // Should show validation errors
    expect(find.text('Please enter your email'), findsOneWidget);
    expect(find.text('Please enter your password'), findsOneWidget);
  });

  testWidgets('Demo credentials are displayed', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Verify demo credentials are shown
    expect(find.text('Demo Credentials:'), findsOneWidget);
    expect(find.textContaining('user@example.com'), findsOneWidget);
    expect(find.textContaining('admin@example.com'), findsOneWidget);
    expect(find.textContaining('test@example.com'), findsOneWidget);
  });
}
