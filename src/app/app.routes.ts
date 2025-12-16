import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SettingsComponent } from './components/settings/settings.component';
import { HistoryComponent } from './components/history/history.component';
import { targetsGuard } from './guards/targets.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [targetsGuard]
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: 'history',
    component: HistoryComponent,
    canActivate: [targetsGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
