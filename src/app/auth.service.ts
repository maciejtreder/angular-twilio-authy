import { Injectable, Inject, PLATFORM_ID, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, flatMap } from 'rxjs/operators';
import { Observable, timer, of, Subscription, Subject } from 'rxjs';
import { isPlatformServer } from '@angular/common';
import { REQUEST } from '@nguniversal/express-engine/tokens';
 
@Injectable({
 providedIn: 'root'
})
export class AuthService {
 
 private redirectUrl: string;
 
 constructor(
   private router: Router,
   private http: HttpClient,
   @Inject(PLATFORM_ID) private platformId: any,
   @Optional() @Inject(REQUEST) private request: any
 ) { }
 
 public setRedirectUrl(url: string) {
   this.redirectUrl = url;
 }
 
 public auth(login: string, password: string): Observable<any> {
   return this.http.post<any>('/auth/login', {login: login, password: password}).pipe(
     flatMap(response => this.secondFactor(response.token) )
   );
 }
 
 private secondFactor(token: string): Observable<any> {
   const httpOptions = {
     headers: new HttpHeaders({'Token':  token})
   };
 
   const tick: Observable<number> = timer(1000, 1000);
   return Observable.create(subject => {
     let tock = 0;
     const timerSubscription = tick.subscribe(() => {
       tock++;
       this.http.get<any>('/auth/status', httpOptions).subscribe( response => {
         if (response.status === 'approved') {
           this.redirectUrl = this.redirectUrl === undefined ? '/' : this.redirectUrl;
           this.router.navigate([this.redirectUrl]);
 
           this.closeSecondFactorObservables(subject, true, timerSubscription);
         } else if (response.status === 'denied') {
           this.closeSecondFactorObservables(subject, false, timerSubscription);
         }
       });
       if (tock === 60) {
         this.closeSecondFactorObservables(subject, false, timerSubscription);
       }
     });
   });
 }
 
 public isAuthenticated(): Observable<boolean> {
   if (isPlatformServer(this.platformId)) {
     return of(this.request.cookies.authentication === 'super-encrypted-value-indicating-that-user-is-authenticated!')
   }
   return this.http.get<any>('/auth/isLogged').pipe(map(response => response.authenticated));
 }
 
 
 private closeSecondFactorObservables(subject: Subject<any>, result: boolean, timerSubscription: Subscription): void {
   subject.next(result);
   subject.complete();
   timerSubscription.unsubscribe();
 }
}

