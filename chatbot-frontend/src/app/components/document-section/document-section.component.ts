import { AnythingLLMService } from '../../services/anythingLLM.services';
import { environment } from '../../../environments/environment';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { faFile, faLink, faUpload, faCalendarAlt, faTrash, faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-document-section',
  templateUrl: './document-section.component.html',
  styleUrls: ['./document-section.component.scss']
})
export class DocumentSectionComponent implements OnInit {
  documents: any[] = [];
  documentLink: string = '';
  icalUrl: string = '';
  selectedFile: File | null = null;

  documentsErrorMessage: string = '';
  documentsSuccessMessage: string = '';

  addDocumentsErrorMessage: string = '';
  addDocumentsSuccessMessage: string = '';
  
  scheduleErrorMessage: string = '';
  scheduleSuccessMessage: string = '';

  selectedYear: string = ''; 
  selectedSemester: string = '';

  faFile = faFile;
  faLink = faLink;
  faUpload = faUpload;
  faCalendarAlt = faCalendarAlt;
  faTrash = faTrash;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;
  faSpinner = faSpinner;

  loading: boolean = false;

  private apiUrl = environment.apiUrl;
  private apiKey = environment.apiKey;

  @ViewChild('confirmDeleteDialog') confirmDeleteDialogTemplate!: TemplateRef<any>;
  confirmDeleteDialogRef!: MatDialogRef<any>;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private anythingLLMService: AnythingLLMService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.fetchDocuments();
  }

  fetchDocuments() {
    this.loading = true;
    const token = localStorage.getItem('llm_token');
    if (token) {
      this.anythingLLMService.getDocuments(this.apiKey).subscribe(
        (response: any[]) => {
          this.documents = response;
          this.loading = false;
        },
        error => {
          console.error('Error fetching documents', error);
          this.documentsErrorMessage = 'Errore durante il recupero dei documenti';
          this.documentsSuccessMessage = '';
          this.loading = false;
        }
      );
    } else {
      this.documentsErrorMessage = 'Token di autenticazione non disponibile';
      this.documentsSuccessMessage = '';
      this.loading = false;
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadSchedule() {
    if (this.selectedYear && this.selectedSemester && this.icalUrl) {
      const token = this.authService.getAccessToken();
      if (token) {
        this.loading = true;
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
            this.scheduleSuccessMessage = 'Calendario caricato con successo';
            this.scheduleErrorMessage = '';
            this.loading = false;
          },
          error => {
            console.error('Error importing and uploading iCal', error);
            this.scheduleErrorMessage = error.error.detail || 'Errore importazione e caricamento iCal';
            this.scheduleSuccessMessage = '';
            this.loading = false;
          }
        );
      } else {
        this.scheduleErrorMessage = 'Token di autenticazione non disponibile';
        this.scheduleSuccessMessage = '';
      }
    }
  } 

  uploadDocument() {
    if (this.selectedFile) {
      this.loading = true;
      this.anythingLLMService.uploadDocument(this.apiKey, this.selectedFile).subscribe(
        response => {
          this.addDocumentsSuccessMessage = 'Documento caricato con successo';
          this.addDocumentsErrorMessage = '';
          this.fetchDocuments();
          this.loading = false;
        },
        error => {
          console.error('Error uploading document', error);
          this.addDocumentsErrorMessage = 'Errore durante il caricamento del documento';
          this.addDocumentsSuccessMessage = '';
          this.loading = false;
        }
      );
    } else {
      this.addDocumentsErrorMessage = 'Nessun file selezionato';
      this.addDocumentsSuccessMessage = '';
    }
  }

  uploadDocumentLink() {
    if (this.documentLink) {
      this.loading = true;
      this.anythingLLMService.uploadDocumentLink(this.apiKey, this.documentLink).subscribe(
        response => {
          this.addDocumentsSuccessMessage = 'Documento caricato con successo tramite link';
          this.addDocumentsErrorMessage = '';
          this.documentLink = '';
          this.fetchDocuments();
          this.loading = false;
        },
        error => {
          console.error('Error uploading document link', error);
          this.addDocumentsErrorMessage = 'Errore durante il caricamento del documento tramite link';
          this.addDocumentsSuccessMessage = '';
          this.loading = false;
        }
      );
    } else {
      this.addDocumentsErrorMessage = 'Inserisci un link valido';
      this.addDocumentsSuccessMessage = '';
    }
  }

  deleteDocument(documentName: string, event: Event): void {
    event.stopPropagation(); // Prevents the click from triggering openUserDetail
    this.confirmDeleteDialogRef = this.dialog.open(this.confirmDeleteDialogTemplate, {
      width: '300px',
      data: { documentName: documentName }
    });

    this.confirmDeleteDialogRef.afterClosed().subscribe(result => {
      if (result) {
        const token = localStorage.getItem('llm_token');
        if (token) {
          this.loading = true;
          this.anythingLLMService.deleteDocument(token, this.apiKey, documentName).subscribe(
            response => {
              this.snackBar.open('Documento eliminato con successo', 'Chiudi', {
                duration: 2000,
              });
              this.fetchDocuments();
              this.loading = false;
            },
            error => {
              console.error('Errore durante l\'eliminazione del documento', error);
                  this.snackBar.open('Errore durante l\'eliminazione del documento', 'Chiudi', {
                    duration: 2000,
                  });
              this.loading = false;
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
