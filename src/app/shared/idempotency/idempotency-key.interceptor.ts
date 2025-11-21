import {v4 as uuidv4} from 'uuid';
import {HttpContextToken, HttpInterceptorFn} from '@angular/common/http';

export const IDEMPOTENCY_CONTEXT = new HttpContextToken(() => false);

export const idempotencyKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const idempotencyKey = req.headers.get('Idempotency-Key') ?? uuidv4();
  const cloned = req.clone({
    setHeaders: {
      'Idempotency-Key': idempotencyKey
    }
  });
  return next(cloned);
};
