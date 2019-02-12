import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProtectedPageComponent } from './protected-page/protected-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { AuthGuardService } from './auth-guard.service';
import { LoginResolverService } from './login-resolver.service';

const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },  
    { path: 'login', component: LoginPageComponent, resolve: {token: LoginResolverService} },
    { path: 'home', component: ProtectedPageComponent, canActivate: [AuthGuardService] },
];

 
@NgModule({
 imports: [RouterModule.forRoot(routes)],
 exports: [RouterModule]
})
export class AppRoutingModule { }
