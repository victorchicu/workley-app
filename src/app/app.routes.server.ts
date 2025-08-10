import {RenderMode, ServerRoute} from '@angular/ssr';
import {ErrorComponent} from './shared/component/error/error.component';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'chat/:chatId',
    renderMode: RenderMode.Client
  },
  {
    path: 'error',
    renderMode: RenderMode.Prerender
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
