//user-input.components.ts
import { Component, EventEmitter, Output } from '@angular/core';

const ENTER_KEY_ASCII = 13;

@Component({
  selector: 'app-user-input',
  templateUrl: './user-input.component.html',
  styleUrls: ['./user-input.component.scss'],
})
export class UserInputComponent {
  @Output() sendMessageEmitter = new EventEmitter<string>();
  message: string = "";

  sendMessage() {
    if (this.message) {
      this.sendMessageEmitter.emit(this.message);
      this.message = "";
    }
  }

  onKeyUp($event: any) {
    if ($event.which === ENTER_KEY_ASCII) {
      this.sendMessage();
    }
  }
}
