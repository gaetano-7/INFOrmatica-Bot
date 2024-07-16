//app.routes.ts
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
import { AdminScreenComponent } from './components/admin-screen/admin-screen.component';
import { ChatChoiceComponent } from './components/chat-choice/chat-choice.component';
import { ChatbotVerifiedComponent } from './components/chatbot-verified/chatbot-verified.component';

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
      { path: 'admin', component: AdminScreenComponent, canActivate: [AuthGuard, AdminGuard] },
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // Imposta la route predefinita per il componente HeaderComponent
      { path: '**', redirectTo: 'home' } // Gestisce qualsiasi altro percorso non definito, reindirizzando a 'home'
    ]
  },
  { path: '**', redirectTo: 'home' } // Gestisce qualsiasi altro percorso non definito all'interno dell'applicazione, reindirizzando a 'home'
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoute { }
