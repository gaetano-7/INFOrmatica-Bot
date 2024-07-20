import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { faUser, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-section',
  templateUrl: './user-section.component.html',
  styleUrls: ['./user-section.component.scss']
})
export class UserSectionComponent implements OnInit {
  @ViewChild('confirmDeleteDialog') confirmDeleteDialogTemplate!: TemplateRef<any>;
  users: any[] = [];
  usersErrorMessage: string = '';
  usersSuccessMessage: string = '';
  faUser = faUser;
  faTrash = faTrash;
  confirmDeleteDialogRef!: MatDialogRef<any>;

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    if (this.authService.isAdmin()) {
      const token = this.authService.getAccessToken();
      if (token) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.get<any[]>(`${this.apiUrl}/users/`, { headers }).subscribe(
          (response: any[]) => {
            const currentUser = localStorage.getItem('username');
            if (currentUser) {
              this.users = response.filter(user => user.username !== currentUser);
            } else {
              console.error('Current user not found in localStorage');
              this.usersErrorMessage = 'Utente corrente non trovato';
              this.usersSuccessMessage = '';
            }
          },
          error => {
            console.error('Error fetching users', error);
            this.usersErrorMessage = error.error.detail || 'Errore durante il recupero degli utenti';
            this.usersSuccessMessage = '';
          }
        );
      } else {
        this.usersErrorMessage = 'Token di autenticazione non disponibile';
        this.usersSuccessMessage = '';
      }
    } else {
      this.usersErrorMessage = 'Non hai le autorizzazioni necessarie per visualizzare gli utenti';
      this.usersSuccessMessage = '';
    }
  }

  deleteUser(userId: number, event: Event): void {
    event.stopPropagation(); // Prevents the click from triggering openUserDetail
    this.confirmDeleteDialogRef = this.dialog.open(this.confirmDeleteDialogTemplate, {
      width: '300px',
      data: { userId: userId }
    });

    this.confirmDeleteDialogRef.afterClosed().subscribe(result => {
      if (result) {
        const token = this.authService.getAccessToken();
        if (token) {
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
          this.http.delete(`${this.apiUrl}/users/${userId}`, { headers }).subscribe(
            () => {
              this.snackBar.open('Utente eliminato con successo', 'Chiudi', {
                duration: 2000,
              });
              this.fetchUsers(); // Refresh the user list after deletion
            },
            error => {
              console.error('Errore durante l\'eliminazione dell\'utente', error);
              this.snackBar.open('Errore durante l\'eliminazione dell\'utente', 'Chiudi', {
                duration: 2000,
              });
            }
          );
        } else {
          this.snackBar.open('Token di autenticazione non disponibile', 'Chiudi', {
            duration: 2000,
          });
        }
      }
    });
  }

  closeConfirmDeleteDialog(result: boolean): void {
    this.confirmDeleteDialogRef.close(result);
  }
}
