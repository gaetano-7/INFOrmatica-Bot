import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Message, MESSAGE_TYPE } from '../../utility/constants';
import { v4 as uuidv4 } from 'uuid';
import { AnythingLLMService } from '../../services/anythingLLM.services';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
  providers: [AnythingLLMService]
})
export class ChatbotComponent implements OnInit {
  data: Message[] = [];
  loading: boolean = false;
  private apiKey = environment.apiKey;
  private dialogRef!: MatDialogRef<any>;

  @ViewChild('confirmDeleteDialog') confirmDeleteDialog!: TemplateRef<any>;

  constructor(
    private anythingLLMService: AnythingLLMService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadConversation();
    this.fetchConversationFromBackend();
  }

  getMessage($event: string) {
    if (!this.loading) {
      let messageObject: Message = this.createMessage($event, MESSAGE_TYPE.USER);
      this.data = [...this.data, messageObject];
      this.loading = true;
      this.saveConversation();

      const user_token = localStorage.getItem('llm_token');

      if (user_token) {
        this.anythingLLMService.askQuestion($event, user_token).subscribe(
          (response: any) => {
            const assistantMessage = this.parseResponse(response.response);
            messageObject = this.createMessage(assistantMessage, MESSAGE_TYPE.ASSISTANT);
            this.data = [...this.data, messageObject];
            this.loading = false;
            this.saveConversation();
          },
          error => {
            console.error('Error asking question:', error);
            this.loading = false;
          }
        );
      } else {
        console.error('Token not found.');
        this.loading = false;
      }
    } else {
      let messageObject: Message = this.createMessage($event, MESSAGE_TYPE.USER);
      this.data = [...this.data, messageObject];
      this.saveConversation();
    }
  }

  createMessage(content: string, type: MESSAGE_TYPE): Message {
    return {
      id: uuidv4(),
      sender: type,
      content: content,
      dateTime: new Date(),
    };
  }

  parseResponse(response: string): string {
    const parts = response.split('\n\n');
    let combinedResponse = '';

    for (const part of parts) {
      if (part.startsWith('data: ')) {
        const jsonString = part.substring(6).trim();
        if (jsonString) {
          try {
            const json = JSON.parse(jsonString);
            if (json.textResponse) {
              combinedResponse += json.textResponse;
            } else {
              console.warn('No textResponse in JSON:', json);
            }
          } catch (error) {
            console.error('Error parsing response part:', jsonString, error);
          }
        } else {
          console.warn('Empty JSON string:', part);
        }
      }
    }

    return combinedResponse;
  }

  public debounce(func: Function, timeout = 400) {
    let timer: any;
    return (...args: any) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }

  private saveConversation() {
    localStorage.setItem('conversation', JSON.stringify(this.data));
  }

  private loadConversation() {
    const savedConversation = localStorage.getItem('conversation');
    if (savedConversation) {
      this.data = JSON.parse(savedConversation);
    }
  }

  private fetchConversationFromBackend() {
    if (this.apiKey) {
      this.anythingLLMService.getConversation(this.apiKey).subscribe(
        (response: any) => {
          console.log('Conversation fetched:', response);
          this.data = [...this.data, ...response];
          this.saveConversation();
        },
        error => {
          console.error('Error fetching conversation:', error);
        }
      );
    } else {
      console.error('Token not found.');
    }
  }

  openConfirmDeleteDialog() {
    this.dialogRef = this.dialog.open(this.confirmDeleteDialog);
  }

  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  confirmDelete() {
    const username = environment.usernameAdmin;
    const password = environment.passwordAdmin;

    this.anythingLLMService.getToken(username, password).pipe(
      switchMap(tokenData => {
        const token = tokenData.token;
        return this.anythingLLMService.deleteAllWorkspacesChat(token);
      })
    ).subscribe(
      () => {
        this.data = [];
        this.saveConversation();
        this.closeDialog();
      },
      error => {
        console.error('Error clearing conversation:', error);
        this.closeDialog();
      }
    );
  }
}

