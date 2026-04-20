/**
 * Console-friendly serialization for unknown errors (including ZodError from plebbit-js RPC validation).
 */
export function formatErrorForConsole(error: unknown): { message: string; issues?: unknown; stack?: string } {
  if (error === null || error === undefined) {
    return { message: String(error) };
  }
  if (typeof error === 'string') {
    return { message: error };
  }
  if (error instanceof Error) {
    const zodLike = error as Error & { issues?: unknown };
    if (Array.isArray(zodLike.issues)) {
      return {
        message: error.message || 'ZodError',
        issues: zodLike.issues,
        stack: error.stack,
      };
    }
    return { message: error.message, stack: error.stack };
  }
  if (typeof error === 'object' && error !== null && 'issues' in error && Array.isArray((error as { issues: unknown }).issues)) {
    const e = error as { message?: string; issues: unknown; stack?: string };
    return {
      message: typeof e.message === 'string' && e.message ? e.message : 'ZodError',
      issues: e.issues,
      stack: typeof e.stack === 'string' ? e.stack : undefined,
    };
  }
  try {
    return { message: JSON.stringify(error) };
  } catch {
    return { message: String(error) };
  }
}
