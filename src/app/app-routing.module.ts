import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { MyaccountComponent } from './myaccount/myaccount.component';
import { MyfilesComponent } from './myfiles/myfiles.component';
import { ResetpasswordComponent } from './recuperarsenha/resetpassword.component';
import { ChatboxComponent } from './chatbox/chatbox.component';
import { VideocallComponent } from './videocall/videocall.component';

const routes: Routes = [

  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'myaccount', component: MyaccountComponent },
  { path: 'myfiles', component: MyfilesComponent },
  { path: 'recuperarsenha', component: ResetpasswordComponent },
  { path: 'chatbox', component: ChatboxComponent },
  { path: 'videocall', component: VideocallComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
