import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '../auth.service';
import { BehaviorSubject, Subject, throwError, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  public message: Subject<string> = new BehaviorSubject('');
  public loginForm: FormGroup = new FormGroup({
  login: new FormControl(''),
  password: new FormControl(''),
  remember: new FormControl(false)
  });

  private authyToken: string = this.router.snapshot.data['token'];

  constructor(private authService: AuthService, private router: ActivatedRoute) { }

  public ngOnInit(): void {
    if (this.authyToken != null) {
      this.message.next('Waiting for second factor.');
      this.handleSecondFactor(this.authService.secondFactor(this.authyToken, true));
    }
  }

  public onSubmit(): void {
    this.message.next('Waiting for second factor.');
    this.handleSecondFactor(this.authService.auth(
    this.loginForm.get('login').value,
    this.loginForm.get('password').value,
      this.loginForm.get('remember').value
    ));
  }

  private handleSecondFactor(secondFactor$: Observable<boolean>): void {
    secondFactor$.pipe(
      catchError(() => {
        this.message.next('Bad credentials.');
        return throwError('Not logged in!');
      }),
      finalize(() => this.message.next('Request timed out or not authorized'))
    ).subscribe();
  }
}
