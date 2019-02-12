import { Injectable, Inject, PLATFORM_ID, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, flatMap, concatMap, take, filter, takeWhile } from 'rxjs/operators';
import { Observable, timer, of } from 'rxjs';
import { isPlatformServer } from '@angular/common';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { StateKey, makeStateKey, TransferState } from '@angular/platform-browser';
@Injectable({
providedIn: 'root'
})
export class AuthService {
 private redirectUrl: string = null;

 constructor(
   private router: Router,
   private http: HttpClient,
   @Inject(PLATFORM_ID) private platformId: any,
   @Optional() @Inject(REQUEST) private request: any,
   private transferState: TransferState,
   @Optional() @Inject('API_KEY') private apiKey
 ) { }

 public setRedirectUrl(url: string) {
   this.redirectUrl = url;
 }
 public auth(login: string, password: string, remember: boolean): Observable<any> {
   return this.http.post<any>(`/auth/login`, {login: login, password: password}).pipe(
     flatMap(response => this.secondFactor(response.token, remember) )
   );
 }

 public secondFactor(token: string, remember: boolean): Observable<any> {
   return timer(1000, 1000).pipe(
     take(5 * 60),
     concatMap(() => this.pollStatus(token, remember)),
     filter(response => response.status != 'pending'),
     map(response => {
       if (response.status === 'approved') {
         this.redirectUrl = this.redirectUrl == null ? '/' : this.redirectUrl;
         this.router.navigate([this.redirectUrl]);
         return true;
       } else if (response.status === 'denied') {
         return false;
       }
     }),
     takeWhile(status => !status)
   );
 }

 public getRememberedToken(): Observable<string> {
   const key: StateKey<string> = makeStateKey<string>('authyToken');

   return Observable.create(subject => {

     if (isPlatformServer(this.platformId) && this.request.cookies.remember) {
       this.http.post<any>(
         `https://api.authy.com/onetouch/json/users/${this.request.cookies.remember}/approval_requests?api_key=${this.apiKey}`,
         {message: 'some message'}
         ).subscribe(resp => {
           this.transferState.set(key, resp.approval_request.uuid);
           subject.next(null);
           subject.complete();
       });
     } else {
       subject.next(this.transferState.get(key, null));
       subject.complete();
     }
   });
 }

 public isAuthenticated(): Observable<boolean> {
   if (isPlatformServer(this.platformId)) {
     return of(this.request.cookies.authentication === 'super-encrypted-value-indicating-that-user-is-authenticated!')
   }
   return this.http.get<any>('/auth/isLogged').pipe(map(response => response.authenticated));
 }

 private pollStatus(token: string, remember: boolean):Observable<any> {
   const httpOptions = {
     headers: new HttpHeaders({
       'Token': token,
       'Remember': '' + remember
     })
   };
   const url = `auth/status?timestamp=${Date.now()}`;

   return this.http.get<any>(url, httpOptions);
 }
}
