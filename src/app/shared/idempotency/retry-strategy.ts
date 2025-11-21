import {RetryConfig, timer} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';

export function retryStrategy(): RetryConfig {
  return {
    count: 3,
    delay: (error, retryCount) => {
      if (!shouldRetry(error)) {
        throw error;
      }
      const backoff = Math.pow(2, retryCount) * 500;
      return timer(backoff);
    },
  };
}

function shouldRetry(error: any): boolean {
  if (error instanceof HttpErrorResponse) {
    // No network / CORS / disconnected
    if (error.status === 0)
      return true;
    // 429 Too Many Requests
    if (error.status === 429)
      return true;
    // Retryable server errors
    if ([503, 504].includes(error.status))
      return true;
    // DO NOT RETRY client errors
    if (error.status >= 400 && error.status < 500)
      return false;
  }
  return false;
}
