import { Component, inject } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <h1>Functional HttpInteceptors</h1>
    <button (click)="callApi()">API Caller</button>
  `,
})
export class AppComponent {
  dataService = inject(DataService);
  callApi = () =>
    this.dataService.getData().subscribe({
      next: (d) => console.log(d),
    });
}
