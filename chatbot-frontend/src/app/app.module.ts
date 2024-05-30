import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoute } from './app.routes';
import { HeaderComponent } from './components/header/header.component';
import { MessagePanelComponent } from './components/message-panel/message-panel.component';
import { UserInputComponent } from './components/user-input/user-input.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RouterModule } from '@angular/router';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminScreenComponent } from './components/admin-screen/admin-screen.component';
import { ConfirmDeleteDialogComponent, UserDetailDialogComponent } from './components/user-detail-dialog/user-detail-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MessagePanelComponent,
    UserInputComponent,
    ChatbotComponent,
    RegisterComponent,
    LoginComponent,
    UserDetailDialogComponent,
    ConfirmDeleteDialogComponent,
    ProfileComponent,
    HomeComponent,
    AdminScreenComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    AppRoute,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([])
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
