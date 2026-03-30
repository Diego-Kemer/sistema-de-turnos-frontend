import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'res/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'res/:slug/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'user-panel/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'user-panel/:id/**',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
