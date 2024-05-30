// user-detail-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-detail-dialog',
  templateUrl: './user-detail-dialog.component.html',
  styleUrls: ['./user-detail-dialog.component.scss']
})
export class UserDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UserDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  deleteUser(): void {
    const confirmDialog = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '250px'
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        this.authService.deleteUserById(this.data.id).subscribe(
          () => {
            this.snackBar.open('Utente eliminato con successo', 'Chiudi', {
              duration: 2000,
            });
            this.dialogRef.close(true); // Pass true to indicate that the user was deleted
          },
          error => {
            console.error('Errore durante l\'eliminazione dell\'utente', error);
            this.snackBar.open('Errore durante l\'eliminazione dell\'utente', 'Chiudi', {
              duration: 2000,
            });
          }
        );
      }
    });
  }
}

// ConfirmDeleteDialogComponent per conferma eliminazione
@Component({
  selector: 'app-confirm-delete-dialog',
  template: `
    <h1 mat-dialog-title>Conferma Eliminazione</h1>
    <div mat-dialog-content>
      <p>Sei sicuro di voler eliminare l'utente?</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">No</button>
      <button mat-button (click)="onYesClick()">Si</button>
    </div>
  `
})
export class ConfirmDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
