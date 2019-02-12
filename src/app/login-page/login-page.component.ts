import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '../auth.service';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
selector: 'app-login-page',
templateUrl: './login-page.component.html',
styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

 public message: Subject<string> = new BehaviorSubject('');
 public loginForm: FormGroup = new FormGroup({
  login: new FormControl(''),
  password: new FormControl(''),
  remember: new FormControl(false)
 });
 

 constructor(private authService: AuthService) { }

  public onSubmit(): void {
    this.message.next('Waiting for second factor.');
    this.authService.auth(
      this.loginForm.get('login').value,
      this.loginForm.get('password').value,
      this.loginForm.get('remember').value
    ).pipe(
    catchError(() => {
      this.message.next('Bad credentials.');
      return throwError('Not logged in!');
    })

    )
    .subscribe(response => {
      if (!response) {
        this.message.next('Request timed out or not authorized');
      }
      console.log('auth response', response);
    });
  }
}
