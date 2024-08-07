//home.component.ts
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { faSignInAlt, faUserPlus, faUser, faSignOutAlt, faBars, faCommentDots, faUserShield } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @ViewChild('logoutDialog') logoutDialogTemplate!: TemplateRef<any>;
  @ViewChild('loginPromptDialog') loginPromptDialogTemplate!: TemplateRef<any>;
  logoutDialogRef!: MatDialogRef<any>;
  loginPromptDialogRef!: MatDialogRef<any>;

  faSignInAlt = faSignInAlt;
  faUserPlus = faUserPlus;
  faUser = faUser;
  faSignOutAlt = faSignOutAlt;
  faBars = faBars;
  faCommentDots = faCommentDots;
  faUserShield = faUserShield;

  constructor(private authService: AuthService, private dialog: MatDialog, private router: Router) { }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  openLogoutDialog(): void {
    this.logoutDialogRef = this.dialog.open(this.logoutDialogTemplate);
  }

  closeLogoutDialog(confirmed: boolean): void {
    this.logoutDialogRef.close();
    if (confirmed) {
      this.logout();
    }
  }

  logout(): void {
    this.authService.logout();
  }

  onChatbotClick(): void {
    if (this.isLoggedIn()) {
      this.router.navigate(['/chat-choice']);
    } else {
      this.openLoginPromptDialog();
    }
  }

  openLoginPromptDialog(): void {
    this.loginPromptDialogRef = this.dialog.open(this.loginPromptDialogTemplate);
  }

  closeLoginPromptDialog(): void {
    this.loginPromptDialogRef.close();
  }

  goToLogin(): void {
    this.closeLoginPromptDialog();
    this.router.navigate(['/login']);
  }
}
