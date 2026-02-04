/**
 * UiPath SDK Client Configuration for Action Apps
 *
 * This file configures the UiPath TypeScript SDK client for Action Center integration.
 * The SDK provides access to TaskEventsService for communicating with Action Center.
 *
 * For Action Apps, the SDK is typically initialized at runtime with credentials
 * received from Action Center via the loadApp event.
 */
import { UiPath } from 'uipath-sdk';
/**
 * Tracks whether the SDK has been initialized with Action Center credentials.
 * Hooks should check this before making API calls.
 */
let sdkInitialized = false;
/**
 * Check if SDK has been initialized with Action Center credentials
 */
export function isSDKInitialized(): boolean {
  return sdkInitialized;
}
/**
 * Create SDK configuration based on available environment variables
 */
function createSDKConfig() {
  const baseUrl = import.meta.env.VITE_UIPATH_BASE_URL || 'https://cloud.uipath.com';
  const orgName = import.meta.env.VITE_UIPATH_ORG_NAME || '';
  const tenantName = import.meta.env.VITE_UIPATH_TENANT_NAME || '';
  const secret = import.meta.env.VITE_UIPATH_ACCESS_TOKEN || '';
  const clientId = import.meta.env.VITE_UIPATH_CLIENT_ID || '';
  const redirectUri = import.meta.env.VITE_UIPATH_REDIRECT_URI || '';
  const scope = import.meta.env.VITE_UIPATH_SCOPE || '';
  // If we have a secret (access token), use it
  if (secret) {
    return {
      baseUrl,
      orgName,
      tenantName,
      secret,
    };
  }
  // If we have OAuth configuration, use it
  if (clientId && scope) {
    return {
      baseUrl,
      orgName,
      tenantName,
      clientId,
      redirectUri: redirectUri || window.location.origin,
      scope,
    };
  }
  // Fallback configuration for Action Center mode (will be overridden at runtime)
  return {
    baseUrl,
    orgName: orgName || 'default',
    tenantName: tenantName || 'default',
    secret: 'placeholder', // Will be replaced by Action Center
  };
}
/**
 * Default UiPath SDK client
 *
 * For Action Apps, credentials are provided at runtime by Action Center.
 * This initial instance uses environment variables as fallback for local development.
 */
let sdk = new UiPath(createSDKConfig());
/**
 * Initialize or reinitialize the SDK with runtime configuration from Action Center
 *
 * This is called when Action Center sends credentials via the loadApp event.
 *
 * @param config - Runtime configuration from Action Center
 */
export function initializeSdk(config: {
  baseUrl: string;
  orgName: string;
  tenantName: string;
  token: string;
}): void {
  sdk = new UiPath({
    baseUrl: config.baseUrl,
    orgName: config.orgName,
    tenantName: config.tenantName,
    secret: config.token,
  });
  sdkInitialized = true;
  console.log('[UiPath SDK] Initialized with Action Center config');
}
/**
 * Update the SDK token when Action Center refreshes it
 *
 * @param newToken - The refreshed authentication token
 */
export function updateToken(newToken: string): void {
  sdk.updateToken(newToken);
  console.log('[UiPath SDK] Token updated');
}
/**
 * Export the SDK instance for direct access by hooks
 */
export { sdk };
/**
 * Type exports for UiPath SDK types
 */
export type { UiPath } from 'uipath-sdk';