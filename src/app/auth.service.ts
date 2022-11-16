import { Injectable, NgZone } from '@angular/core';
import { User } from "../app/user";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { MatSnackBar } from '@angular/material';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userData: any; // Save logged in user data

  constructor(
    public snackBar: MatSnackBar,
    public afs: AngularFirestore,   // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) { 
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    })
  }

  // Sign in with email/password
  SignIn(email, password) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.ngZone.run(() => {
          this.router.navigate(['home']);
        });
        // this.SetUserData(result.user);
      }).catch((error) => {
        let message = error.message
        //Convertendo Valores do Firebase
        if(error.message == 'The email address is badly formatted.')
        {
          message = 'O endereço de e-mail está incorreto.'
        }
        if(error.message == 'The password is invalid or the user does not have a password.')
        {
          message = 'A senha é inválida ou o usuário não possui uma senha.'
        }
        let snackBarRef = this.snackBar.open(message, 'Fechar', {duration: 5000});
      })
  }

  // Auth logic to run auth providers
  AuthLogin(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((result) => {
        this.ngZone.run(() => {
          this.router.navigate(['home']);
        })
        this.SetUserData(result.user);
      }).catch((error) => {
        window.alert(error)
      })
  }

  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      firstName: null,
      lastName: null,
      dateofbirth: null,
      address: null,
      insurancecompany: null,
      insuranceid: null,
      isDoctor: false
    }
    return userRef.set(userData, {
      merge: true
    })
  }

  // Sign up with email/password
  SignUp(email, password) {
    const hasNumbers = /\d/.test(password)
    if(password.length < 8 || !hasNumbers)
    {
      let snackBarRef = this.snackBar.open('A senha deve incluir pelo menos 8 caracteres e um número!', 'Fechar', {duration: 6000});
    }
    else {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((result) => {
        this.SetUserData(result.user);
        let snackBarRef = this.snackBar.open('Cadastrado com sucesso, por favor faça o login!', '', {duration: 3000});
      }).catch((error) => {
        let snackBarRef = this.snackBar.open(error.message, 'Fechar', {duration: 5000});
      })
    }
  }

  // Reset Forgot password
  ForgotPassword(passwordResetEmail) {
    return this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        let snackBarRef = this.snackBar.open('Email de redefinição de senha enviado, verifique sua caixa de entrada.', '', {duration: 3000});
      }).catch((error) => {
        let snackBarRef = this.snackBar.open(error.message, 'Fechar', {duration: 5000});
      })
  }

  SignOut() {
    return this.afAuth.auth.signOut().then(() => {
      localStorage.removeItem('result.user');
      this.router.navigate(['login']);
    })
  }
}

