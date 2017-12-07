import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {AppComponent} from './app.component';
import {LoginComponent} from './views/login.component';
import {PlayerComponent} from './views/player.component';
import {RegisterComponent} from './views/register.component';
import {QueueComponent} from './views/queue.component';
import {FavoritesComponent} from './views/favorites.component';
import {UpdateComponent} from './views/update.component';

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
  MatRadioModule,
  MatSnackBarModule,
  MatTableModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SnackbarService} from './services/snackbar.service';
import {UserService} from './services/user.service';
import {WsHandlerService} from './services/socket/ws-handler.service';
import {WebSocketService} from './services/socket/websocket.service';
import {TrackService} from './services/track.service';
import {FavoriteService} from './services/favorite.service';
import {QueueService} from './services/queue.service';
import {HttpClientModule} from '@angular/common/http';
import {PlayerService} from './services/player.service';
import {Ng2Webstorage} from 'ngx-webstorage';
import {AboutComponent} from './views/about/about.component';

RouterModule.forRoot([
  {
    path: 'login',
    component: LoginComponent
  }
]);

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    PlayerComponent,
    QueueComponent,
    UpdateComponent,
    LoginComponent,
    FavoritesComponent,
    AboutComponent
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
    MatRadioModule,
    HttpClientModule,
    Ng2Webstorage,
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
        path: 'update',
        component: UpdateComponent
      },
      {
        path: 'about',
        component: AboutComponent
      },
      {
        path: 'main',
        component: QueueComponent
      },
      {
        path: '',
        redirectTo: '/main',
        pathMatch: 'full'
      }
    ])
  ],
  providers: [
    WebSocketService,
    WsHandlerService,
    UserService,
    SnackbarService,
    QueueService,
    TrackService,
    FavoriteService,
    PlayerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
