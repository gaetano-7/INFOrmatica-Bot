import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AnythingLLMService } from '../../services/anythingLLM.services';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { faCheckCircle, faTimesCircle, faSpinner} from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-admin-response-verification',
  templateUrl: './admin-response-verification.component.html',
  styleUrls: ['./admin-response-verification.component.scss']
})
export class AdminResponseVerificationComponent implements OnInit {
  chats: any[] = [];

  loading: boolean = false;

  chatsErrorMessage: string = '';
  chatsSuccessMessage: string = '';

  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;
  faSpinner = faSpinner;

  @ViewChild('confirmResponseDialog') confirmResponseDialogTemplate!: TemplateRef<any>;
  confirmResponseDialogRef!: MatDialogRef<any>;

  constructor(
    private anythingLLMService: AnythingLLMService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadChats();
  }

  loadChats() {
    this.loading = true;
    const token = localStorage.getItem('llm_token');

    if (token) {
      this.anythingLLMService.getUnverifiedChats().subscribe(
        (data: any[]) => {
          this.chats = data;
          this.loading = false;
        },
        error => {
          console.error('Error fetching chats', error);
          this.chatsErrorMessage = 'Errore durante il recupero delle chat';
          this.chatsSuccessMessage = '';
          this.loading = false;
        }
      );
    } else {
      this.chatsErrorMessage = 'Token di autenticazione non disponibile';
      this.chatsSuccessMessage = '';
      this.loading = false;
    }

  }

  confirmResponse(chat: any, event: Event): void {
    chat.verified_response = chat.ai_response;

    event.stopPropagation(); // Prevents the click from triggering openUserDetail
    this.confirmResponseDialogRef = this.dialog.open(this.confirmResponseDialogTemplate, {
      width: '300px',
      data: { chat: chat }
    });

    this.confirmResponseDialogRef.afterClosed().subscribe(result => {
      if (result) {
        const token = localStorage.getItem('llm_token');
        if (token) {
          this.loading = true;
          this.anythingLLMService.verifyChatResponse(chat.id, chat.verified_response).subscribe(
            response => {
              this.snackBar.open('Risposta verificata con successo', 'Chiudi', {
                duration: 2000,
              });
              this.loadChats();
              this.loading = false;
            },
            error => {
              console.error('Errore durante la verificazione della risposta', error);
                  this.snackBar.open('Errore durante la verificazione della risposta', 'Chiudi', {
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

  enableEdit(chat: any) {
    chat.editMode = true;
  }

  cancelEdit(chat: any) {
    chat.editMode = false;
  }

  updateResponse(chat: any, event: Event): void {
    event.stopPropagation(); // Prevents the click from triggering openUserDetail
    this.confirmResponseDialogRef = this.dialog.open(this.confirmResponseDialogTemplate, {
      width: '300px',
      data: { chat: chat }
    });

    this.confirmResponseDialogRef.afterClosed().subscribe(result => {
      if (result) {
        const token = localStorage.getItem('llm_token');
        if (token) {
          this.loading = true;
          this.anythingLLMService.verifyChatResponse(chat.id, chat.verified_response).subscribe(
            response => {
              this.snackBar.open('Risposta verificata con successo', 'Chiudi', {
                duration: 2000,
              });
              this.loadChats();
              this.loading = false;
            },
            error => {
              console.error('Errore durante la verificazione della risposta', error);
                  this.snackBar.open('Errore durante la verificazione della risposta', 'Chiudi', {
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
    chat.editMode = false;
  }

  closeConfirmResponseDialog(result: boolean): void {
    this.confirmResponseDialogRef.close(result);
  }
}
