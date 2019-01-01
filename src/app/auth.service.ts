import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
 
@Injectable({
 providedIn: 'root'
})
export class AuthService {
 
 private authenticated = false;
 private redirectUrl: string;
 
 constructor(private router: Router, private http: HttpClient) { }
 
 public setRedirectUrl(url: string) {
   this.redirectUrl = url;
 }
 
 public auth(login: string, password: string): Observable<any> {
   return this.http.post<any>('/auth/login', {login: login, password: password}).pipe(
     tap( () => {
       this.authenticated = true;
       this.redirectUrl = this.redirectUrl === undefined ? '/' : this.redirectUrl;
       this.router.navigate([this.redirectUrl]);
     })
   );
 }
 
 public isAuthenticated(): boolean {
   return this.authenticated;
 }
}

