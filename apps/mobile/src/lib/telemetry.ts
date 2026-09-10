import { Platform } from 'react-native';
import auth from '@react-native-firebase/auth';

// Use the local dev URL for now, you can switch to production URL when deploying
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api/mobile';

interface TelemetryError {
  errorMessage: string;
  stackTrace?: string;
  type?: 'ERROR' | 'NETWORK' | 'CRASH' | 'AUTH' | 'PAYMENT';
  metadata?: Record<string, any>;
}

/**
 * Reports an error to the backend Telemetry system.
 * This will show up in the Admin Panel -> System Health -> Live Mobile App Telemetry.
 */
export async function reportAppError(errorInfo: TelemetryError) {
  try {
    const currentUser = auth().currentUser;
    const token = currentUser ? await currentUser.getIdToken() : null;

    if (!token) {
      console.log('[Telemetry] Skipping error report: User not logged in.');
      return; // Only report errors for logged-in users to avoid spam
    }

    const payload = {
      action: 'reportError',
      data: {
        errorMessage: errorInfo.errorMessage,
        stackTrace: errorInfo.stackTrace || '',
        os: Platform.OS,
        appVersion: '1.0.0', // Could be fetched from expo-constants
        deviceModel: 'Unknown Device', // Could be fetched from expo-device
        type: errorInfo.type || 'ERROR',
        metadata: errorInfo.metadata || {},
      },
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn('[Telemetry] Failed to report error to server.', response.status);
    }
  } catch (err) {
    // Failsafe: Do not crash the app if telemetry fails
    console.warn('[Telemetry] Error sending telemetry:', err);
  }
}

/**
 * Helper to wrap promises and report them automatically if they fail.
 */
export async function withTelemetry<T>(
  promise: Promise<T>,
  type: TelemetryError['type'],
  contextMsg: string
): Promise<T> {
  try {
    return await promise;
  } catch (error: any) {
    reportAppError({
      errorMessage: `${contextMsg}: ${error.message || 'Unknown failure'}`,
      stackTrace: error.stack || '',
      type,
    });
    throw error; // Re-throw so the app can still handle it
  }
}
