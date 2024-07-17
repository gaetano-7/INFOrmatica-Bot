import { Component, OnInit, ViewChild, TemplateRef, ElementRef, Input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Message, MESSAGE_TYPE } from '../../utility/constants';
import { v4 as uuidv4 } from 'uuid';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

const ENTER_KEY_ASCII = 13;

@Component({
  selector: 'app-chatbot-verified',
  templateUrl: './chatbot-verified.component.html',
  styleUrls: ['./chatbot-verified.component.scss']
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

      // Show confirmation message to user
      const confirmationMessage = "La tua domanda è stata correttamente inviata. La segreteria risponderà entro 5-10 minuti.";
      messageObject = this.createMessage(confirmationMessage, MESSAGE_TYPE.ASSISTANT);
      this._messages = [...this._messages, messageObject];
      this.loading = false;
      this.saveConversation();

      // Simulate delay and fetch the response from the database
      setTimeout(() => {

      }, 300000); // 5 minutes delay
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

    this.closeDialog();
  }
}
