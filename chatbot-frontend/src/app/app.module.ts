import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoute } from './app.routes';
import { RouterModule } from '@angular/router';

// Angular Material Modules
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';


// FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Application Components
import { HeaderComponent } from './components/header/header.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { ChatbotVerifiedComponent } from './components/chatbot-verified/chatbot-verified.component';
import { ChatChoiceComponent } from './components/chat-choice/chat-choice.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { HomeComponent } from './components/home/home.component';
import { AdminSectionChoiceComponent } from './components/admin-section-choice/admin-section-choice.component';
import { UserSectionComponent } from './components/user-section/user-section.component';
import { DocumentSectionComponent } from './components/document-section/document-section.component';
import { AdminResponseVerificationComponent } from './components/admin-response-verification/admin-response-verification.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ChatbotComponent,
    ChatbotVerifiedComponent,
    ChatChoiceComponent,
    RegisterComponent,
    LoginComponent,
    ProfileComponent,
    HomeComponent,
    AdminSectionChoiceComponent,
    UserSectionComponent,
    DocumentSectionComponent,
    AdminResponseVerificationComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoute,
    RouterModule.forRoot([]),
    // Angular Material Modules
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTabsModule,
    MatDialogModule,
    MatCardModule,
    MatListModule,
    MatSnackBarModule,
    // FontAwesome
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
