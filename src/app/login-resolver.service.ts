import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
 providedIn: 'root'
})
export class LoginResolverService implements Resolve<Observable<string>> {

 constructor(private authService: AuthService) { }

 resolve(): Observable<string> {
   return this.authService.getRememberedToken();
 }
}
