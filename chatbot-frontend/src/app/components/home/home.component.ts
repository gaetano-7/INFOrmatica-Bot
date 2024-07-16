import { Router } from '@angular/router';
import { Component, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  @ViewChild('loginPromptDialog') loginPromptDialogTemplate!: TemplateRef<any>;
  loginPromptDialogRef!: MatDialogRef<any>;

  constructor(private authService: AuthService, private dialog: MatDialog, private router: Router) { }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  onChatbotClick(): void {
    if (this.isLoggedIn()) {
      this.router.navigate(['/chat-choice']);
    } else {
      this.openLoginPromptDialog();
    }
  }

  openLoginPromptDialog(): void {
    this.loginPromptDialogRef = this.dialog.open(this.loginPromptDialogTemplate, {
      disableClose: false // Permette di chiudere il dialogo cliccando fuori
    });
  }

  closeLoginPromptDialog(): void {
    this.loginPromptDialogRef.close();
  }

  goToLogin(): void {
    this.closeLoginPromptDialog();
    this.router.navigate(['/login']);
  }
}
