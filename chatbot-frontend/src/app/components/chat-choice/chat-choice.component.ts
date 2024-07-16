import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { faRobot, faUserCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-chat-choice',
  templateUrl: './chat-choice.component.html',
  styleUrls: ['./chat-choice.component.scss']
})
export class ChatChoiceComponent {
  faRobot = faRobot;
  faUserCheck = faUserCheck;

  constructor(private router: Router) {}

  selectChatMode(mode: string) {
    if (mode === 'ai') {
      this.router.navigate(['/chat']);
    } else if (mode === 'ai-verified') {
      this.router.navigate(['/chat-verified']);
    }
  }
}
