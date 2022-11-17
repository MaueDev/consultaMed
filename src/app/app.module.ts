import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { HomeComponent } from './Home/home.component';
import { AuthService } from './auth.service';
import { LoginComponent } from './Login/login.component';
import { SignupComponent } from './sair/signup.component';
import { MeuPerfilComponent } from './MeuPerfil/meuperfil.component';
import { MeuArquivosComponent } from './MeusArquivos/meusarquivos.component';
import { ResetpasswordComponent } from './recuperarsenha/resetpassword.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule } from '@angular/material';
import {MatNativeDateModule, MatRippleModule} from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatTableModule} from '@angular/material'
import { MatToolbarModule, MatIconModule, MatSidenavModule, MatListModule, MatButtonModule } from  '@angular/material';
import { ComponenteAgendarCompromissos } from './agendarcompromissoss/ComponenteAgendarCompromissos.component';
import { DatePipe } from '@angular/common';
import { MatMenuModule} from '@angular/material/menu';
import { ChatboxComponent } from './chatbox/chatbox.component';
import { NgxAgoraModule } from 'ngx-agora';
import { VideocallComponent } from './videochamada/videochamada.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    MeuPerfilComponent,
    MeuArquivosComponent,
    ResetpasswordComponent,
    ComponenteAgendarCompromissos,
    ChatboxComponent,
    VideocallComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatInputModule,
    MatDialogModule,
    MatMenuModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatMenuModule,
    MatInputModule,
    MatButtonModule,
    MatInputModule,
    MatToolbarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRippleModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule, 
    MatOptionModule,
    NgxAgoraModule.forRoot({ AppID: environment.firebaseConfig.agora.appId }),
  ],

  providers: [
    AuthService,
    DatePipe
  ],
  bootstrap: [AppComponent],
  entryComponents: [ComponenteAgendarCompromissos]
})
export class AppModule {
  constructor(private db: AngularFirestore) {
    const things = db.collection('Users').valueChanges();
    things.subscribe(console.log);
  }
 }
