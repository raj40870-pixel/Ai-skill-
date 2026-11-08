/**
 * Enterprise Silent Error Telemetry & Watchdog
 * Captures unhandled client exceptions & promise rejections without disrupting user experience.
 */

let isInitialized = false;

export interface TelemetryErrorPayload {
  type: 'API_FAILURE' | 'GEMINI_QUOTA' | 'FRONTEND_CRASH' | 'NETWORK_TIMEOUT';
  message: string;
  pageUrl?: string;
  component?: string;
  userId?: string;
  browserInfo?: string;
  severity?: 'CRITICAL' | 'WARNING' | 'INFO';
}

export function reportErrorToTelemetry(
  err: any,
  component: string = 'GeneralUI',
  severity: 'CRITICAL' | 'WARNING' | 'INFO' = 'WARNING'
) {
  try {
    const rawMessage = typeof err === 'string' 
      ? err 
      : err?.message || err?.reason?.message || (err ? JSON.stringify(err) : 'Unknown client error');

    if (!rawMessage || rawMessage.includes('ResizeObserver') || rawMessage.includes('Extension context')) {
      return; // Ignore browser-native benign noise
    }

    // Determine type
    let type: TelemetryErrorPayload['type'] = 'FRONTEND_CRASH';
    const lower = rawMessage.toLowerCase();
    if (lower.includes('quota') || lower.includes('429') || lower.includes('resource_exhausted')) {
      type = 'GEMINI_QUOTA';
    } else if (lower.includes('network') || lower.includes('failed to fetch') || lower.includes('load failed') || lower.includes('timeout')) {
      type = 'NETWORK_TIMEOUT';
    } else if (lower.includes('api') || lower.includes('500') || lower.includes('server')) {
      type = 'API_FAILURE';
    }

    let userId = '';
    try {
      const stored = localStorage.getItem('careernav_user_profile');
      if (stored) {
        const u = JSON.parse(stored);
        userId = u.uid || u.email || '';
      }
    } catch {}

    const payload: TelemetryErrorPayload = {
      type,
      message: rawMessage.slice(0, 500),
      pageUrl: typeof window !== 'undefined' ? window.location.pathname : '/',
      component,
      userId,
      browserInfo: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      severity
    };

    // Use sendBeacon for maximum non-blocking reliability if available
    const url = '/api/telemetry/errors';
    const jsonStr = JSON.stringify(payload);

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const sent = navigator.sendBeacon(url, blob);
      if (sent) return;
    }

    // Fallback to fetch with keepalive
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: jsonStr,
      keepalive: true
    }).catch(() => {});
  } catch {
    // Fail completely silently to protect user experience
  }
}

export function initErrorWatchdog() {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  window.addEventListener('error', (event: ErrorEvent) => {
    reportErrorToTelemetry(
      event.error || event.message,
      event.filename ? `${event.filename.split('/').pop()}:${event.lineno}` : 'WindowGlobal',
      'CRITICAL'
    );
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    reportErrorToTelemetry(
      event.reason,
      'PromiseUnhandledRejection',
      'WARNING'
    );
  });

  console.log('[Telemetry] Silent Error Watchdog initialized.');
}
