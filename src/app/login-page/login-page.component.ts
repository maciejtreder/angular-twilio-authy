import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '../auth.service';
 
@Component({
 selector: 'app-login-page',
 templateUrl: './login-page.component.html',
 styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
 
 public loginForm: FormGroup = new FormGroup({
   login: new FormControl(''),
   password: new FormControl('')
 });
 
 constructor(private authService: AuthService) { }
 
 public onSubmit(): void {
   this.authService.auth(
     this.loginForm.get('login').value,
     this.loginForm.get('password').value
   );
 }
}

