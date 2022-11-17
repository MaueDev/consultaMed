import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';
import { MatDialogModule, MatDialogRef } from '@angular/material';
import { DatePipe } from '@angular/common';


export interface userdoc {
  medico: string;
  email: string;
  uid: string;
}

export interface time {
  value: string;
}

@Component({
  selector: 'app-agendarcompromissoss',
  templateUrl: './ComponenteAgendarCompromissos.component.html',
  styleUrls: ['./ComponenteAgendarCompromissos.component.css']
})
export class ComponenteAgendarCompromissos implements OnInit {
  displayuid: string;
  displayemail: string;
  isMedicoDisplay:string;
  isMedico: boolean;
  medicos:string[] = [];
  primeiroNomeDisplay: string;
  sobreNomeDisplay: string;
  pacientes:string[] = [];
  userdoc:userdoc[] = [];
  count = 1;
  dataatual = new Date();
  vulgo: string;

  time: time[] = [
    {value: '08:00'}, {value: '09:00'}, {value: '10:00'}, {value: '11:00'}, {value: '12:00'}, {value: '13:00'}, {value: '14:00'}, {value: '15:00'}, {value: '16:00'}, {value: '17:00'}, {value: '18:00'},
  ];

  constructor(public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public dialogRef: MatDialogRef<ComponenteAgendarCompromissos>) { }

  ngOnInit() {

    try {
      this.displayuid = this.afAuth.auth.currentUser.uid
      localStorage.setItem("displayuid", this.displayuid);
    } catch (error) {
      this.displayuid = localStorage.getItem("displayuid");
    }

    try {
      this.displayemail = this.afAuth.auth.currentUser.email;
      localStorage.setItem("displayemail", this.displayemail);
      console.log(this.displayemail);
    } catch (error) {
      this.displayemail = localStorage.getItem("displayemail");
      console.log(this.displayemail);
    }
    this.buscarDadosUsuario();
    this.updateCompromissos();
  }

  horarioPardraoBrasil(value) {
    if (value == "08:00") {
      return "8:00"
    }
    if (value == "09:00") {
      return "9:00"
    }
    if (value == "10:00") {
      return "10:00"
    }
    if (value == "11:00") {
      return "11:00"
    }
    if (value == "12:00") {
      return "12:00"
    }
    if (value == "13:00") {
      return "13:00"
    }
    if (value == "14:00") {
      return "14:00"
    }
    if (value == "15:00") {
      return "15:00"
    }
    if (value == "16:00") {
      return "16:00"
    }
    if (value == "17:00") {
      return "17:00"
    }
    if (value == "18:00") {
      return "18:00"
    }
  }

  buscarDadosUsuario() {
    var docRef = this.afs.collection('usuario').doc(this.displayuid);
    docRef.get().toPromise().then((doc) => {
      if (doc.exists) {
          this.primeiroNomeDisplay = doc.data().primeiroNome;
          this.sobreNomeDisplay = doc.data().sobrenome;
          if (doc.data().isMedico == true) {
            this.isMedicoDisplay = "Médico(a)";
            this.isMedico = true;
            this.vulgo = "";
          } else {
            this.isMedicoDisplay = "Paciente";
            this.isMedico = false;
            this.vulgo = "Dr(a). ";
          }
      } else {
          console.log("Não há documento!");
      }
  }).catch(function(error) {
      console.log("Erro ao obter o documento:", error);
  });
  }

  updateCompromissos() {
    this.afs.collection('usuario').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        if (this.isMedico == true) {
          if (doc.data().isMedico == false) {
            if (doc.data().uid != this.displayuid) {
              if (!(doc.data().primeiroNome == null || doc.data().primeiroNome == null || doc.data().primeiroNome == "" || doc.data().sobrenome == "")) {
                var test = {medico: doc.data().primeiroNome + " " + doc.data().sobrenome, email: doc.data().email, uid: doc.data().uid}
                this.userdoc.push(test);
              }
              } 
            }
          }
        if (this.isMedico == false) {
          if (doc.data().isMedico == true) {
            if (doc.data().uid != this.displayuid) {
              if (!(doc.data().primeiroNome == null || doc.data().primeiroNome == null || doc.data().primeiroNome == "" || doc.data().sobrenome == "")) {
                var test = {medico: doc.data().primeiroNome + " " + doc.data().sobrenome, email: doc.data().email, uid: doc.data().uid}
                this.userdoc.push(test);
              }
            }
            }
          } 
      });
    });
  }


  salvarCompromisso(Date2, Time, Medico) {
    console.log(Date2)
    console.log(Time)
    console.log(Medico)
    var timestamp = new Date(Date2 + " " + this.horarioPardraoBrasil(Time))
    let id = this.afs.createId()
    for (var i = 0; i < this.userdoc.length; i++) {
      if (this.userdoc[i].medico == Medico)
      {
        var receptorid = this.userdoc[i].uid;
        var receptoremail = this.userdoc[i].email;
      }
    }
    this.afs.collection('compromissos').doc(id).set({
      compromisso_id: id,
      remetente: this.primeiroNomeDisplay + " " + this.sobreNomeDisplay,
      remetenteuid: this.displayuid,
      receptoruid: receptorid,
      remetenteemail: this.displayemail,
      receptoremail: receptoremail,
      isActive: true,
      Date: Date2,
      Time: Time,
      receptor: Medico,
      timestamp: timestamp
    });
    this.dialogRef.close();
  }

  refresh() {
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
  filterMedico(date) {
    this.afs.collection('compromissos').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        if (doc.data().Date == date)
        {
          // Se o documento atual tiver o uid do usuário como remetente ou destinatário.
          if (this.displayuid == doc.data().remetenteuid)
          {
            this.userdoc = this.userdoc.filter(order => order.medico !== doc.data().receptor);
          }
          if (this.displayuid == doc.data().receptoruid)
          {
            this.userdoc = this.userdoc.filter(order => order.medico !== doc.data().remetente);
          }
        }
      });
    })
  }

  filterHorario(medico, date){
    this.time = [
      {value: '08:00'}, {value: '09:00'}, {value: '10:00'}, {value: '11:00'}, {value: '12:00'}, {value: '13:00'}, {value: '14:00'}, {value: '15:00'}, {value: '16:00'}, {value: '17:00'}, {value: '18:00'},
    ];
    this.afs.collection('compromissos').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        if (doc.data().Date == date)
        {
          if (doc.data().remetente == this.primeiroNomeDisplay + " " + this.sobreNomeDisplay || doc.data().receptor == this.primeiroNomeDisplay + " " + this.sobreNomeDisplay)
          {
            this.time = this.time.filter(order => order.value !== doc.data().Time);
            console.log(doc.data().Time);
          }
          if (doc.data().remetente == medico || doc.data().receptor == medico)
          {
            this.time = this.time.filter(order => order.value !== doc.data().Time);
            console.log(doc.data().Time);
          }
        }
      });
    })
  }

  returnuserdoc() {
    console.log(this.userdoc)
  }
}
