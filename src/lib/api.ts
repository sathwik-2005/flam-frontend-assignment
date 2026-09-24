import { GenerateApiRequest, GenerateApiResponse, EvaluationErrorDetails } from '../types/result';

const API_TIMEOUT_MS = 15000; // 15s timeout guard

/**
 * Frontend API Client
 * Strictly calls our backend proxy /api/generate.
 * NEVER makes direct LLM calls from the browser bundle.
 */
export async function callGenerateApi(request: GenerateApiRequest, signal?: AbortSignal): Promise<GenerateApiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  // Link signal if external abort passed in
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.error || {
          type: 'FAILED_REQUEST',
          title: `Server HTTP ${response.status}`,
          message: `Backend proxy returned status ${response.status} (${response.statusText}).`,
          timestamp: new Date().toLocaleTimeString(),
        },
      };
    }

    const data: GenerateApiResponse = await response.json();
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      const timeoutError: EvaluationErrorDetails = {
        type: 'TIMEOUT',
        title: 'Request Timed Out',
        message: `The request took longer than ${API_TIMEOUT_MS / 1000} seconds and was automatically cancelled to prevent hanging UI.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      return {
        success: false,
        error: timeoutError,
      };
    }

    const networkError: EvaluationErrorDetails = {
      type: 'FAILED_REQUEST',
      title: 'Network / Connection Failure',
      message: err?.message || 'Failed to connect to the backend server. Make sure the proxy server is running.',
      timestamp: new Date().toLocaleTimeString(),
    };

    return {
      success: false,
      error: networkError,
    };
  }
}
