// message-panel.component.ts
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Message } from '../../utility/constants';

@Component({
  selector: 'app-message-panel',
  templateUrl: './message-panel.component.html',
  styleUrls: ['./message-panel.component.scss'],
})
export class MessagePanelComponent {
  @ViewChild('scrollframe', { static: true }) scrollFrame!: ElementRef;

  private scrollContainer: any;
  private _messages: Message[] = [];

  userPath = "../../assets/user-path.png";
  avatarPath = "../../assets/unical-profile.png";

  @Input() loading!: boolean;

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
}
