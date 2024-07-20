import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { faUser, faFileAlt, faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-section-choice',
  templateUrl: './admin-section-choice.component.html',
  styleUrls: ['./admin-section-choice.component.scss']
})
export class AdminSectionChoiceComponent {
  faUser = faUser;
  faFileAlt = faFileAlt;
  faCheck = faCheck;

  constructor(private router: Router) {}

  selectSection(mode: string) {
    if (mode === 'users') {
      this.router.navigate(['admin/users']);
    } else if (mode === 'documents') {
      this.router.navigate(['admin/documents']);
    } else if (mode === 'verify-responses') {
      this.router.navigate(['admin/verify-responses']);
    }
  }
}
