import { Component, OnInit, ViewChild, TemplateRef, ElementRef, Input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Message, MESSAGE_TYPE } from '../../utility/constants';
import { v4 as uuidv4 } from 'uuid';
import { switchMap } from 'rxjs';
import { AnythingLLMService } from '../../services/anythingLLM.services';
import { environment } from '../../../environments/environment';

const ENTER_KEY_ASCII = 13;

@Component({
  selector: 'app-chatbot-verified',
  templateUrl: './chatbot-verified.component.html',
  styleUrls: ['./chatbot-verified.component.scss'],
  providers: [AnythingLLMService]
})
export class ChatbotVerifiedComponent implements OnInit {
  private _messages: Message[] = [];
  @Input() loading!: boolean;
  private apiKey = environment.apiKey;
  private dialogRef!: MatDialogRef<any>;
  private scrollContainer: any;

  message: string = "";

  userPath = "../../assets/user-path.png";
  avatarPath = "../../assets/unical-profile.png";

  @ViewChild('confirmDeleteDialog') confirmDeleteDialog!: TemplateRef<any>;
  @ViewChild('scrollframe', { static: true }) scrollFrame!: ElementRef;

  constructor(
    private anythingLLMService: AnythingLLMService,
    private dialog: MatDialog
  ) {}

  sendMessage() {
    if (this.message) {
      this.getMessage(this.message);
      this.message = "";
    }
  }

  onKeyUp($event: any) {
    if ($event.which === ENTER_KEY_ASCII) {
      this.sendMessage();
    }
  }

  @Input() set messages(data: Message[]) {
    this.updateData(data).then(() => {
      if (data.length) {
        this.scrollToBottom();
      }
    });
  }

  get messages(): Message[] {
    return this._messages;
  }

  updateData(data: Message[]) {
    return new Promise((resolve) => {
      this._messages = [...data];
      resolve(true);
    });
  }

  ngAfterViewInit() {
    this.scrollContainer = this.scrollFrame?.nativeElement;
  }

  public scrollToBottom(): void {
    if (this.scrollContainer) {
      this.scrollContainer.scroll({
        top: this.scrollContainer.scrollHeight,
        left: 0,
        behavior: 'smooth'
      });
    }
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }

  ngOnInit() {
    this.loadConversation();
    this.fetchConversationFromBackend();
  }

  getMessage($event: string) {
    if (!this.loading) {
      let messageObject: Message = this.createMessage($event, MESSAGE_TYPE.USER);
      this._messages = [...this._messages, messageObject];
      this.loading = true;
      this.saveConversation();

      const user_token = localStorage.getItem('llm_token');

      if (user_token) {
        const user_id = localStorage.getItem('user_id');

        if (user_id) {
          this.anythingLLMService.askVerifiedQuestion($event, user_id, user_token).subscribe(
            (response: any) => {
              const assistantMessage = 'La tua domanda è stata inoltrata alla segreteria e riceverai una risposta entro 5-10 minuti.';
              messageObject = this.createMessage(assistantMessage, MESSAGE_TYPE.ASSISTANT);
              this._messages = [...this._messages, messageObject];
              this.loading = false;
              this.saveConversation();
            },
            error => {
              console.error('Error asking question:', error);
              this.loading = false;
            }
          );
        } else {
          console.error('User ID not found.');
          this.loading = false;
        }
      } else {
        console.error('Token not found.');
        this.loading = false;
      }
    } else {
      let messageObject: Message = this.createMessage($event, MESSAGE_TYPE.USER);
      this._messages = [...this._messages, messageObject];
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

  public debounce(func: Function, timeout = 400) {
    let timer: any;
    return (...args: any) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }

  private saveConversation() {
    localStorage.setItem('conversation_verified', JSON.stringify(this._messages));
  }

  private loadConversation() {
    const savedConversation = localStorage.getItem('conversation_verified');
    if (savedConversation) {
      this._messages = JSON.parse(savedConversation);
    }
  }

  private fetchConversationFromBackend() {
    const user_id = localStorage.getItem('user_id');
    if (user_id) {
      this.anythingLLMService.getVerifiedConversation(user_id).subscribe(
        (response: any) => {
          console.log('Conversation fetched:', response);
          const newMessages: Message[] = [];
          response.forEach((msg: any) => {
            const userMessage = this.createMessage(msg.question, MESSAGE_TYPE.USER);
            newMessages.push(userMessage);

            const assistantMessageContent = msg.verified_response ?? 'La tua domanda è stata inoltrata alla segreteria e riceverai una risposta entro 5-10 minuti.';
            const assistantMessage = this.createMessage(assistantMessageContent, MESSAGE_TYPE.ASSISTANT);
            newMessages.push(assistantMessage);
          });
          this._messages = newMessages;
          this.saveConversation();
        },
        error => {
          console.error('Error fetching conversation:', error);
        }
      );
    } else {
      console.error('User ID not found.');
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
        this._messages = [];
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
