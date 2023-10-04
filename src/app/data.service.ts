import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  http = inject(HttpClient);

  getData(): Observable<any> {
    const url = 'some wrong url to test the interceptor';
    return this.http.get(url);
  }
}
