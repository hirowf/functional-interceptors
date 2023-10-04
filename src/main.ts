import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { httpErrorInterceptor } from './app/http-error.interceptor';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withInterceptors([httpErrorInterceptor]))],
});
