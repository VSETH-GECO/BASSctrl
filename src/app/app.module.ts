import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {AppComponent} from './app.component';
import {LoginComponent} from './login.component';
import {PlayerComponent} from './player.component';
import {MainViewComponent} from './main-view.component';
import {RegisterComponent} from './register.component';

import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatToolbarModule
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
    LoginComponent
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
