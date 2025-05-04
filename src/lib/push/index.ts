import { Capacitor } from '@capacitor/core';
import type { LocalNotification } from './common';
import { requestWebNotificationPermission, showWebLocalNotification } from './web';
import { requestNativeNotificationPermission, showNativeLocalNotification, initializeNativeNotificationListeners } from './native';
import { requestElectronNotificationPermission, showElectronLocalNotification } from './electron';

// --- Platform Detection Functions ---
function checkIsElectron(): boolean {
  // Check window property dynamically
  return window.electronApi?.isElectron === true;
}

function checkIsNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

let notificationIdCounter = Date.now(); // Simple counter for unique IDs

// --- Initialization ---

/**
 * Initializes platform-specific notification listeners (currently only needed for Capacitor).
 * Should be called once when the app starts.
 */
export function initializeNotificationSystem(): void {
  const isNative = checkIsNativePlatform();
  const isElectron = checkIsElectron();
  if (isNative) {
    initializeNativeNotificationListeners();
  }
  console.log('Notification system initialized for platform:', isNative ? 'Native' : isElectron ? 'Electron' : 'Web');
}

// --- Permissions ---

/**
 * Requests permission to show notifications based on the current platform.
 * Must be called from a user interaction context (e.g., button click).
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const isNative = checkIsNativePlatform();
  const isElectron = checkIsElectron();

  if (isNative) {
    return requestNativeNotificationPermission();
  }
  if (isElectron) {
    return requestElectronNotificationPermission();
  }
  // Fallback to Web Platform
  if (!isNative && !isElectron) {
    return requestWebNotificationPermission();
  }
  console.warn('Notification permission request: Unknown platform.');
  return false;
}

// --- Showing Notifications ---

/**
 * Shows a local notification using the appropriate platform API.
 */
export async function showLocalNotification(notificationData: Omit<LocalNotification, 'id'>): Promise<void> {
  const id = notificationIdCounter++;
  const platformNotification = { ...notificationData, id };

  console.log('Attempting to show notification:', platformNotification);

  const isNative = checkIsNativePlatform();
  const isElectron = checkIsElectron();

  if (isNative) {
    return showNativeLocalNotification(platformNotification);
  }
  if (isElectron) {
    return showElectronLocalNotification(platformNotification);
  }
  // Fallback to Web Platform
  if (!isNative && !isElectron) {
    return showWebLocalNotification(platformNotification);
  }

  console.warn('Show notification: Unknown platform.');
}
