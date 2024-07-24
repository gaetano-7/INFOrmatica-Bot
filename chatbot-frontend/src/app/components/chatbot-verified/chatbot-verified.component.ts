import { Component, OnInit, ViewChild, TemplateRef, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Message, MESSAGE_TYPE } from '../../utility/constants';
import { v4 as uuidv4 } from 'uuid';
import { Subscription, switchMap } from 'rxjs';
import { AnythingLLMService } from '../../services/anythingLLM.services';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ThemeService } from '../../services/theme.services';

const ENTER_KEY_ASCII = 13;

@Component({
  selector: 'app-chatbot-verified',
  templateUrl: './chatbot-verified.component.html',
  styleUrls: ['./chatbot-verified.component.scss'],
  providers: [AnythingLLMService]
})
export class ChatbotVerifiedComponent implements OnInit {
  private _messages: Message[] = [];
  private _loading: boolean = false; 
  private apiKey = environment.apiKey;
  private dialogRef!: MatDialogRef<any>;
  private scrollContainer: any;
  private themeSubscription!: Subscription;
  sidebarOpen: boolean = true;

  isDarkMode: boolean = true; 

  message: string = "";
  currentChat = 'segreteria'; 

  userPath = "../../assets/avatar-user.png";
  avatarPath = "../../assets/avatar-unical.png";
  aiPath = "../../assets/avatar-ai.png";

  @ViewChild('confirmDeleteDialog') confirmDeleteDialog!: TemplateRef<any>;
  @ViewChild('scrollframe', { static: true }) scrollFrame!: ElementRef;

  constructor(
    private anythingLLMService: AnythingLLMService,
    private dialog: MatDialog,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private themeService: ThemeService
  ) {}

  @Input() set loading(value: boolean) {
    this._loading = value;
    this.scrollToBottom(); 
  }

  get loading(): boolean {
    return this._loading;
  }

  navigateToChat(chat: string) {
    this.currentChat = chat;
    this.sidebarOpen = false;
    if (chat === 'assistant') {
      this.router.navigate(['/chat']);
    } else if (chat === 'segreteria') {
      this.router.navigate(['/chat-verified']);
    }
    this.scrollToBottom();
  }

  sendMessage() {
    if (this.message) {
      this.getMessage(this.message);
      this.message = "";
      this.scrollToBottom();
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
    this.scrollToBottom();
  }

  public scrollToBottom(): void {
    this.cdr.detectChanges(); 
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
    this.scrollToBottom();
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDarkMode => {
      this.isDarkMode = isDarkMode;
      this.applyTheme();
    });
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  getMessage($event: string) {
    if (!this.loading) {
      let messageObject: Message = this.createMessage($event, MESSAGE_TYPE.USER);
      this._messages = [...this._messages, messageObject];
      this.loading = true;
      this.saveConversation();
      this.scrollToBottom();

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
              this.scrollToBottom();
            }
          );
        } else {
          console.error('User ID not found.');
          this.loading = false;
          this.scrollToBottom();
        }
      } else {
        console.error('Token not found.');
        this.loading = false;
        this.scrollToBottom();
      }
    } else {
      let messageObject: Message = this.createMessage($event, MESSAGE_TYPE.USER);
      this._messages = [...this._messages, messageObject];
      this.saveConversation();
      this.scrollToBottom();
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
          this.scrollToBottom();
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
        this.scrollToBottom();
      },
      error => {
        console.error('Error clearing conversation:', error);
        this.closeDialog();
        this.scrollToBottom();
      }
    );
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.scrollToBottom();
  }

  applyTheme() {
    const body = document.body;
    if (this.isDarkMode) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
