import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatListModule } from '@angular/material/list'
import { MatInputModule, MatInput } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { NgModule } from '@angular/core'

@NgModule ({
  exports: [
    MatInputModule,
    MatListModule,
    MatMenuModule
  ]
})

@Component({
  selector: 'app-meuperfil',
  templateUrl: './meuperfil.component.html',
  styleUrls: ['./meuperfil.component.css']
})
export class MeuPerfilComponent implements OnInit {
  displayemail: string;
  displayuid: string;
  primeiroNomeDisplay: string;
  sobreNomeDisplay: string;
  dobDisplay: string;
  enderecoDisplay:string;
  planoSaudeDisplay: string;
  planoSaudeIdDisplay: string;
  isMedicoDisplay:string;
  vulgo: string;
  isMedico: boolean;

  constructor(
    public authService: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,   
  ) {
  }
 
  
  ngOnInit() {

    try {
      this.displayuid = this.afAuth.auth.currentUser.uid
      localStorage.setItem("displayuid", this.displayuid);
      console.log(this.displayuid);
    } catch (error) {
      this.displayuid = localStorage.getItem("displayuid");
      console.log(this.displayuid);
    }

    try {
      this.displayemail = this.afAuth.auth.currentUser.email
      localStorage.setItem("displayemail", this.displayemail);
      console.log(this.displayemail);
    } catch (error) {
      this.displayemail = localStorage.getItem("displayemail");
      console.log(this.displayemail);
    }

    
    this.buscarDadosUsuario()

  }

  buscarDadosUsuario() {
  var docRef = this.afs.collection('usuario').doc(this.displayuid);
  docRef.get().toPromise().then((doc) => {
    if (doc.exists) {
        this.primeiroNomeDisplay = doc.data().primeiroNome;
        this.sobreNomeDisplay = doc.data().sobrenome;
        this.dobDisplay = doc.data().dataAniversario;
        this.enderecoDisplay = doc.data().endereco;
        this.planoSaudeDisplay = doc.data().planodesaude;
        this.planoSaudeIdDisplay = doc.data().planodesaudeid;
        if (doc.data().isMedico == true) {
          this.isMedicoDisplay = "Médico(a)";
          this.vulgo = "Dr(a). "
          this.isMedico = true;
        } else {
          this.isMedico = false;
          this.isMedicoDisplay = "Paciente";
        }
      } else {
        console.log("Não há documento!");
    }
}).catch(function(error) {
    console.log("Erro ao obter documento:", error);
});
}

  isMenuOpen = true;
  contentMargin = 240;

  onToolbarMenuToggle() {
    console.log('No toolbar toggled', this.isMenuOpen);
    this.isMenuOpen = !this.isMenuOpen;

    if (!this.isMenuOpen) {
      this.contentMargin = 70;
    } else {
      this.contentMargin = 240;
    }
  }
  addData(primeiroNome, sobrenome, dataAniversario, endereco, planodesaude, planodesaudeid) {
    this.afs.collection('usuario').doc(this.afAuth.auth.currentUser.uid).update({
      uid: this.afAuth.auth.currentUser.uid,
      email: this.afAuth.auth.currentUser.email,
      displayName: this.afAuth.auth.currentUser.displayName,
      photoURL: this.afAuth.auth.currentUser.photoURL,
      emailVerified: this.afAuth.auth.currentUser.emailVerified,
      primeiroNome: primeiroNome,
      sobrenome: sobrenome,
      dataAniversario: dataAniversario,
      endereco: endereco,
      planodesaude: planodesaude,
      planodesaudeid: planodesaudeid
    })
      .then(function () {
        console.log("Dados gravados")
      });
      this.afs.collection('compromissos').get().toPromise()
      .then(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          var updatedoc = doc.data().compromisso_id;
          if (doc.data().remetenteuid == this.displayuid)
          {
            this.afs.collection('compromissos').doc(updatedoc).update({
              remetente: primeiroNome + " " + sobrenome,
            })
            .then(function () {
              console.log("Dados gravados")
            });
          }
          if (doc.data().receptoruid == this.displayuid)
          {
            this.afs.collection('compromissos').doc(updatedoc).update({
              receptor: primeiroNome + " " + sobrenome,
            })
            .then(function () {
              console.log("Dados gravados")
            });
          }
        });
      })
      this.ngOnInit();
     
  }
}