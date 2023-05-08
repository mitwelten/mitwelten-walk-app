import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  public message = '';

  public loginForm = new FormGroup({
    username: new FormControl<string>('', { validators: [Validators.required], nonNullable: true}),
    password: new FormControl<string>('', { validators: [Validators.required], nonNullable: true}),
  });

  constructor(
    private dialogRef: MatDialogRef<LoginComponent>,
    private authService: AuthService
    ) {}

  login() {
    this.authService.login({
      username: this.loginForm.controls.username.value,
      password: this.loginForm.controls.password.value
    }).subscribe({
      next: (loggedIn) => {
        if(loggedIn) {
          this.dialogRef.close(true);
        }
      },
      error: error => this.message = 'Login failed!'
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
