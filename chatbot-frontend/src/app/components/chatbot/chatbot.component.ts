import { Component, OnInit, ViewChild, TemplateRef, ElementRef, Input, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Message, MESSAGE_TYPE } from '../../utility/constants';
import { v4 as uuidv4 } from 'uuid';
import { AnythingLLMService } from '../../services/anythingLLM.services';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ThemeService } from '../../services/theme.services';
import { Subscription } from 'rxjs';

const ENTER_KEY_ASCII = 13;

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
  providers: [AnythingLLMService]
})
export class ChatbotComponent implements OnInit, AfterViewInit {
  private _messages: Message[] = [];
  private _loading: boolean = false;
  private apiKey = environment.apiKey;
  private dialogRef!: MatDialogRef<any>;
  private scrollContainer: any;
  private themeSubscription!: Subscription;
  sidebarOpen: boolean = true;

  isDarkMode: boolean = true;

  message: string = "";
  currentChat = 'assistant'; 

  userPath = "../../assets/avatar-user.png";
  avatarPath = "../../assets/avatar-ai.png";
  segreteriaPath = "../../assets/avatar-unical.png";

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
        this.anythingLLMService.askQuestion($event, user_token).subscribe(
          (response: any) => {
            const assistantMessage = response.response;
            messageObject = this.createMessage(assistantMessage, MESSAGE_TYPE.ASSISTANT);
            this._messages = [...this._messages, messageObject];
            this.loading = false;
            this.saveConversation();
            this.scrollToBottom();
          },
          error => {
            console.error('Error asking question:', error);
            this.loading = false;
            this.scrollToBottom();
          }
        );
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
    localStorage.setItem('conversation', JSON.stringify(this._messages));
  }

  private loadConversation() {
    const savedConversation = localStorage.getItem('conversation');
    if (savedConversation) {
      this._messages = JSON.parse(savedConversation);
    }
  }

  private fetchConversationFromBackend() {
    if (this.apiKey) {
      this.anythingLLMService.getConversation(this.apiKey).subscribe(
        (response: any) => {
          console.log('Conversation fetched:', response);
          this._messages = [...this._messages, ...response];
          this.saveConversation();
          this.scrollToBottom();
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
