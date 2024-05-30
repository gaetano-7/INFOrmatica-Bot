import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: [
    './profile.component.scss',
  ]
})
export class ProfileComponent implements OnInit {
  accessToken: string | null = null;
  userRole: string | null = '';
  id: string | null = '';
  username: string | null = '';
  llmToken: string | null = '';
  llmId: string | null = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.accessToken = this.authService.getAccessToken();
    this.userRole = this.authService.currentUserRole;
    this.id = this.authService.currentUserId;
    this.username = localStorage.getItem('username');
    this.llmToken = localStorage.getItem('llm_token');
    this.llmId = localStorage.getItem('access_token');}
}
