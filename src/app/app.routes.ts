import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pokedex',
    pathMatch: 'full',
  },
  {
    path: 'pokedex',
    loadComponent: () => import('./components/pokedex/pokedex.component').then(m => m.PokedexComponent),
  },
];
