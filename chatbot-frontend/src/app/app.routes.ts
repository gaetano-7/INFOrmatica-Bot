import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { HeaderComponent } from './components/header/header.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { ChatChoiceComponent } from './components/chat-choice/chat-choice.component';
import { ChatbotVerifiedComponent } from './components/chatbot-verified/chatbot-verified.component';
import { AdminSectionChoiceComponent } from './components/admin-section-choice/admin-section-choice.component';
import { UserSectionComponent } from './components/user-section/user-section.component';
import { DocumentSectionComponent } from './components/document-section/document-section.component';
import { AdminResponseVerificationComponent } from './components/admin-response-verification/admin-response-verification.component';

const routes: Routes = [
  {
    path: '', component: HeaderComponent, children: [
      { path: 'home', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
      { path: 'chat-choice', component: ChatChoiceComponent },
      { path: 'chat', component: ChatbotComponent, canActivate: [AuthGuard] },
      { path: 'chat-verified', component: ChatbotVerifiedComponent, canActivate: [AuthGuard] },
      { path: 'register', component: RegisterComponent },
      { path: 'admin', component: AdminSectionChoiceComponent, canActivate: [AuthGuard, AdminGuard] },
      { path: 'admin/users', component: UserSectionComponent, canActivate: [AuthGuard, AdminGuard] },
      { path: 'admin/documents', component: DocumentSectionComponent, canActivate: [AuthGuard, AdminGuard] },
      { path: 'admin/verify-responses', component: AdminResponseVerificationComponent, canActivate: [AuthGuard, AdminGuard] },
      { path: '', redirectTo: 'home', pathMatch: 'full' }, 
      { path: '**', redirectTo: 'home' }
    ]
  },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoute { }
