import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Example using functional interceptor
 */

export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = '';
      if (error.error instanceof ErrorEvent) {
        console.log('this is client side error');
        errorMsg = `Client Error: ${error.error.message}`;
      } else {
        console.log('this is server side error');
        errorMsg = `Server Error Code: ${error.status}, Message: ${error.message}`;
      }

      console.log(errorMsg);
      return throwError(() => errorMsg);
    }),
  );
};
