import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderService } from './core/services/loader.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  loader = inject(LoaderService);
  protected readonly title = signal('turnosMK');
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initPush();
    }
  }

  private initPush() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/push-sw.js')
        .then(() => console.log('SW registrado'))
        .catch(err => console.error(err));
    }
  }
}
