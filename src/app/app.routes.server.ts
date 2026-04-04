import {RenderMode, ServerRoute} from '@angular/ssr';

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
    path: 'shared/:messageId',
    renderMode: RenderMode.Client
  },
  {
    path: 'my/jobs',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
