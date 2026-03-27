import {v4 as uuidv4} from 'uuid';
import {HttpInterceptorFn} from '@angular/common/http';

export const idempotencyKeyInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'POST') {
    return next(req);
  }
  const idempotencyKey = req.headers.get('Idempotency-Key') ?? uuidv4();
  const cloned = req.clone({
    setHeaders: {
      'Idempotency-Key': idempotencyKey
    }
  });
  return next(cloned);
};
