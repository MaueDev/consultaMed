import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './Home/home.component';
import { LoginComponent } from './Login/login.component';
import { SignupComponent } from './sair/signup.component';
import { MeuPerfilComponent } from './MeuPerfil/meuperfil.component';
import { MeuArquivosComponent } from './MeusArquivos/meusarquivos.component';
import { ResetpasswordComponent } from './recuperarsenha/resetpassword.component';
import { ChatboxComponent } from './chatbox/chatbox.component';
import { VideocallComponent } from './videochamada/videochamada.component';

const routes: Routes = [

  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sair', component: SignupComponent },
  { path: 'meuperfisdaql', component: MeuPerfilComponent },
  { path: 'meusarquivos', component: MeuArquivosComponent },
  { path: 'recuperarsenha', component: ResetpasswordComponent },
  { path: 'chatbox', component: ChatboxComponent },
  { path: 'videochamada', component: VideocallComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
