import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.loading = true;
    const { email, username, first_name, last_name, password } = this.registerForm.value;

    this.authService.register(email, username, first_name, last_name, password)
      .subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('Registrazione riuscita!', 'Chiudi', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/login']);
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Registrazione fallita. Riprova.', 'Chiudi', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }
}
