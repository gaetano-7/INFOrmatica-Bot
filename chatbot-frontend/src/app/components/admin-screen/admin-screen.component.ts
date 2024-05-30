// admin-screen.component.ts

import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserDetailDialogComponent } from '../user-detail-dialog/user-detail-dialog.component';
import { environment } from '../../../environments/environment';
import { AnythingLLMService } from '../../services/anythingLLM.services';

@Component({
  selector: 'app-admin-screen',
  templateUrl: './admin-screen.component.html',
  styleUrls: ['./admin-screen.component.scss']
})
export class AdminScreenComponent implements OnInit {
  users: any[] = [];
  documents: any[] = [];
  icalUrl: string = '';
  documentLink: string = '';
  selectedFile: File | null = null;

  usersErrorMessage: string = '';
  usersSuccessMessage: string = '';

  documentsErrorMessage: string = '';
  documentsSuccessMessage: string = '';

  scheduleErrorMessage: string = '';
  scheduleSuccessMessage: string = '';

  addDocumentsErrorMessage: string = '';
  addDocumentsSuccessMessage: string = '';

  selectedYear: string = ''; // Variabile per memorizzare la selezione dell'anno
  selectedSemester: string = ''; // Variabile per memorizzare la selezione del semestre

  private apiUrl = environment.apiUrl;
  private apiKey = environment.apiKey;
  @ViewChild('confirmDeleteDialog') confirmDeleteDialog!: TemplateRef<any>;
  dialogRef!: MatDialogRef<any>;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public dialog: MatDialog,
    private anythingLLMService: AnythingLLMService
  ) {}

  ngOnInit() {
    this.fetchUsers();
    this.fetchDocuments();
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

  fetchDocuments() {
    const token = localStorage.getItem('llm_token');
    if (token) {
      this.anythingLLMService.getDocuments(this.apiKey).subscribe(
        (response: any[]) => {
          this.documents = response;
        },
        error => {
          console.error('Error fetching documents', error);
          this.documentsErrorMessage = 'Errore durante il recupero dei documenti';
          this.documentsSuccessMessage = '';
        }
      );
    } else {
      this.documentsErrorMessage = 'Token di autenticazione non disponibile';
      this.documentsSuccessMessage = '';
    }
  }

  confirmDelete(documentName: string) {
    this.dialogRef = this.dialog.open(this.confirmDeleteDialog, {
      width: '400px',
      data: { name: documentName }
    });
  }

  deleteDocument(documentName: string) {
    const token = localStorage.getItem('llm_token');
    if (token) {
      this.anythingLLMService.deleteDocument(token, this.apiKey, documentName).subscribe(
        response => {
          this.documentsSuccessMessage = 'Documento eliminato con successo';
          this.documentsErrorMessage = '';
          this.dialogRef.close();
          this.fetchDocuments();
        },
        error => {
          console.error('Error deleting document', error);
          this.documentsErrorMessage = 'Errore durante l\'eliminazione del documento';
          this.documentsSuccessMessage = '';
          this.dialogRef.close();
        }
      );
    } else {
      this.documentsErrorMessage = 'Token di autenticazione non disponibile';
      this.documentsSuccessMessage = '';
      this.dialogRef.close();
    }
  }

  openUserDetail(userId: number) {
    const token = this.authService.getAccessToken();
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.get(`${this.apiUrl}/users/${userId}`, { headers }).subscribe(
        (user: any) => {
          const dialogRef = this.dialog.open(UserDetailDialogComponent, {
            width: '400px',
            data: user
          });
        },
        error => {
          console.error('Error fetching user details', error);
          this.usersErrorMessage = error.error.detail || 'Errore durante il recupero dei dettagli dell\'utente';
          this.usersSuccessMessage = '';
        }
      );
    } else {
      this.usersErrorMessage = 'Token di autenticazione non disponibile';
      this.usersSuccessMessage = '';
    }
  }

  onSubmit(): void {
    if (this.authService.isAdmin()) {
      if (this.selectedYear && this.selectedSemester && this.icalUrl) {
        const token = this.authService.getAccessToken();
        if (token) {
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
          const filename = `orario${this.selectedYear}_${this.selectedSemester}.json`;
  
          this.http.post(`${this.apiUrl}/schedule/import-ical-and-upload/`, null, {
            headers,
            params: {
              url: this.icalUrl,
              api_key: this.apiKey,
              filename
            }
          }).subscribe(
            response => {
              this.scheduleSuccessMessage = 'Calendario caricato e caricato con successo';
              this.scheduleErrorMessage = '';
            },
            error => {
              console.error('Error importing and uploading iCal', error);
              this.scheduleErrorMessage = error.error.detail || 'Errore durante l\'importazione e il caricamento di iCal';
              this.scheduleSuccessMessage = '';
            }
          );
        } else {
          this.scheduleErrorMessage = 'Token di autenticazione non disponibile';
          this.scheduleSuccessMessage = '';
        }
      } else {
        this.scheduleErrorMessage = 'Seleziona anno, semestre e inserisci URL iCal';
        this.scheduleSuccessMessage = '';
      }
    } else {
      this.scheduleErrorMessage = 'Non hai le autorizzazioni necessarie per eseguire questa operazione';
      this.scheduleSuccessMessage = '';
    }
  }
  

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadDocument() {
    if (this.selectedFile) {
      this.anythingLLMService.uploadDocument(this.apiKey, this.selectedFile).subscribe(
        response => {
          this.addDocumentsSuccessMessage = 'Documento caricato con successo';
          this.addDocumentsErrorMessage = '';
          this.fetchDocuments();
        },
        error => {
          console.error('Error uploading document', error);
          this.addDocumentsErrorMessage = 'Errore durante il caricamento del documento';
          this.addDocumentsSuccessMessage = '';
        }
      );
    } else {
      this.addDocumentsErrorMessage = 'Nessun file selezionato';
      this.addDocumentsSuccessMessage = '';
    }
  }

  uploadDocumentLink() {
    if (this.documentLink) {
      this.anythingLLMService.uploadDocumentLink(this.apiKey, this.documentLink).subscribe(
        response => {
          this.addDocumentsSuccessMessage = 'Documento caricato con successo tramite link';
          this.addDocumentsErrorMessage = '';
          this.documentLink = '';
          this.fetchDocuments();
        },
        error => {
          console.error('Error uploading document link', error);
          this.addDocumentsErrorMessage = 'Errore durante il caricamento del documento tramite link';
          this.addDocumentsSuccessMessage = '';
        }
      );
    } else {
      this.addDocumentsErrorMessage = 'Inserisci un link valido';
      this.addDocumentsSuccessMessage = '';
    }
  }
}
