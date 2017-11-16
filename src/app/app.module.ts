import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {AppComponent} from './app.component';
import {LoginComponent} from './views/login.component';
import {PlayerComponent} from './views/player.component';
import {MainViewComponent} from './views/main-view.component';
import {RegisterComponent} from './views/register.component';
import {PlaylistComponent} from './views/playlist.component';
import {FavoritesComponent} from './views/favorites.component';

import {
  MatButtonModule,
  MatCardModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatTableModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CookieService} from 'angular2-cookie/core';

RouterModule.forRoot([
  {
    path: 'login',
    component: LoginComponent
  }
]);

@NgModule({
  declarations: [
    AppComponent,
    MainViewComponent,
    RegisterComponent,
    PlayerComponent,
    PlaylistComponent,
    LoginComponent,
    FavoritesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MatListModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatSnackBarModule,
    MatTableModule,
    MatGridListModule,
    MatExpansionModule,
    MatTooltipModule,
    RouterModule.forRoot([
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      },
      {
        path: 'favorites',
        component: FavoritesComponent
      },
      {
        path: 'main',
        component: MainViewComponent
      },
      {
        path: '',
        redirectTo: '/main',
        pathMatch: 'full'
      }
    ])
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule {}
