import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import {FormControl} from '@angular/forms';


export interface userdoc {
  medico: string;
  email: string;
  uid: string;
}

interface userGroup {
  _categoria: string;
  _allUsuario: any;
}

export interface usuariomessage {
  date: any;
  message: any;
  receptor: any;
  receptoruid: string;
  remetente: string;
  remetenteuid: string;
  time: any;
  timestamp: string;
}

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css']
})
export class ChatboxComponent implements OnInit {
  displayuid: string;
  displayemail: string;
  primeiroNomeDisplay: string;
  sobreNomeDisplay: string;
  isMedicoDisplay: string;
  vulgo: string;
  isMedico: boolean;
  medicodoc:userdoc[] = [];
  pacientedoc:userdoc[] = [];
  compromissodoc:userdoc[] = [];
  checkbool: boolean;
  flag: boolean;
  selectedcompromisso: string;
  expenses: any;
  books: any;
  value: any;
  selecteduid: string;
  noappt: boolean;
  messagebool: boolean;

  usuariomessage: usuariomessage[] = [
  ];

  messagedoc: usuariomessage[] = [
  ];

  messagewithdoc: userdoc[] = [
  ];
 
  userControl = new FormControl();
  medicouserGroups: userGroup[] = [
    {
      _categoria: 'Compromissos com',
      _allUsuario: this.compromissodoc,
    },
    {
      _categoria: 'Mensagens com',
      _allUsuario: this.messagewithdoc,
    },
    {
      _categoria: 'Todos Médicos',
      _allUsuario: this.medicodoc,
    },
    {
      _categoria: 'Todos Pacientes',
      _allUsuario: this.pacientedoc,
    },
  ];

  pacienteuserGroups: userGroup[] = [
    {
      _categoria: 'Compromissos com',
      _allUsuario: this.compromissodoc,
    },
    {
      _categoria: 'Mensagens com',
      _allUsuario: this.messagewithdoc,
    },
  ];


  constructor(
    public authService: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,   
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private snackbar: MatSnackBar,
  ) { }
  

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
    } catch (error) {
      this.displayemail = localStorage.getItem("displayemail");
    }
    
    this.buscarDadosUsuario()

    // Atualiza medicos
    this.updateMedicoPaciente()

    // Atualizar compromissos
    this.updateCompromissos()

    this.updateMessages()

  }

  buscarDadosUsuario() {
    var docRef = this.afs.collection('usuario').doc(this.displayuid);
    docRef.get().toPromise().then((doc) => {
      if (doc.exists) {
          this.primeiroNomeDisplay = doc.data().primeiroNome;
          this.sobreNomeDisplay = doc.data().sobrenome;
          if (doc.data().isMedico == true) {
            this.isMedicoDisplay = "Médico(a)";
            this.vulgo = "Dr(a). "
            this.isMedico = true;
          } else {
            this.isMedicoDisplay = "Paciente";
            this.isMedico = false;
          }
      } else {
          console.log("Não há documento!");
      }
  }).catch(function(error) {
      console.log("Erro ao obter o documento:", error);
  });
  }

  // Este método atualiza a lista de seleção na página de bate-papo com médicos e pacientes.
  updateMedicoPaciente() {
    this.afs.collection('usuario').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
          // Se eles são médicos
          if (doc.data().isMedico == true) {
            // e eles não são você
            if (doc.data().uid != this.displayuid) {
              // Remove todos os usuários sem nomes
              if (!(doc.data().primeiroNome == null || doc.data().primeiroNome == null || doc.data().primeiroNome == "" || doc.data().sobrenome == "")) {
                // então imprime seu nome
                var test = {medico: doc.data().primeiroNome + " " + doc.data().sobrenome, email: doc.data().email, uid: doc.data().uid}
                this.medicodoc.push(test);
              }
            }
          }
          if (doc.data().isMedico == false) {
            // e eles não são você
            if (doc.data().uid != this.displayuid) {
              // Remove todos os usuários sem nomes
              if (!(doc.data().primeiroNome == null || doc.data().primeiroNome == null || doc.data().primeiroNome == "" || doc.data().sobrenome == "")) {
                // então imprime seu nome
                var test = {medico: doc.data().primeiroNome + " " + doc.data().sobrenome, email: doc.data().email, uid: doc.data().uid}
                this.pacientedoc.push(test);
                }
              }
            }
        }
        );
        });
    }

    updateMessages() {
      this.afs.collection('chats').doc(this.displayuid).collection('chatswith').get().toPromise()
      .then(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          if (doc.exists) {
            var test = {medico: doc.data().user_name, email: doc.data().user_email, uid: doc.data().user_uid};
            this.messagewithdoc.push(test);
            this.noappt = false;
          } else {
            this.noappt = true;
          }
      });
    });
    }

  // Este método atualiza a lista de seleção na página de bate-papo com as pessoas com quem você tem compromissos.
    updateCompromissos() {
      this.afs.collection('compromissos').get().toPromise()
      .then(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          this.checkbool = true;
          // Se o documento atual tiver o uid do usuário como remetente ou destinatário.
          if (this.displayuid == doc.data().remetenteuid)
          {
            for (var i = 0; i < this.compromissodoc.length; i++) {
              if (this.compromissodoc[i].uid == doc.data().receptoruid)
                {
                  this.checkbool = false;
                }
              }
            if (this.checkbool == true)
              {
                var test = {medico: doc.data().receptor, email: doc.data().receptoremail, uid: doc.data().receptoruid}
                this.compromissodoc.push(test);
              }
              } 
          if (this.displayuid == doc.data().receptoruid)
          {
            for (var i = 0; i < this.compromissodoc.length; i++) {
              if (this.compromissodoc[i].uid == doc.data().remetenteuid)
                {
                  this.checkbool = false;
                }
              }
            if (this.checkbool == true)
              {
                var test = {medico: doc.data().remetente, email: doc.data().remetenteemail, uid: doc.data().remetenteuid}
                this.compromissodoc.push(test);
              }
              } 
      });
      if (this.noappt = true) {
        if (this.compromissodoc.length == 0)
        {
          if (this.isMedico == false)
          {
            this.noappt = true;
          }
        } else {
        this.noappt = false;
        } 
      }
      //console.log(this.noappt)
    })
  }

  noApptDialog() {
    if (this.compromissodoc.length == 0) {
      this.snackbar.open("Nenhum compromisso encontrado para o usuário atual. Agende um horário para conversarmos.", 'Fechar', {duration: 10000});
    }
  }

  sendMessage(message) {
    var date = new Date();
    var currenttime = this.datePipe.transform(new Date(), "h:mm a")
    var dataatual = this.datePipe.transform(new Date(), "dd/M/yyyy")
    var personuid = this.selectedcompromisso;
    var message = message; 
    for (var i = 0; i < this.compromissodoc.length; i++) {
      if (this.compromissodoc[i].uid == personuid)
        {
        var person = this.compromissodoc[i].medico;
        }
    }
    if (person == undefined) {
      for (var i = 0; i < this.medicodoc.length; i++) {
        if (this.medicodoc[i].uid == personuid)
          {
          var person = this.medicodoc[i].medico;
          }
      }
    }
    if (person == undefined) {
      for (var i = 0; i < this.pacientedoc.length; i++) {
        if (this.pacientedoc[i].uid == personuid)
          {
          var person = this.pacientedoc[i].medico;
          }
      }
    }
    let autoid = this.afs.createId()
    if (this.displayuid < personuid)
    {
      var id = this.displayuid + personuid;
    } else {
      var id = personuid + this.displayuid;
    }
    var docRef = this.afs.collection('chats').doc(id);
    docRef.get().toPromise().then((doc) => {
    if (doc.exists)
      {
        docRef.collection('messages').doc(autoid).set({
          message: message,
          from: this.primeiroNomeDisplay + " " + this.sobreNomeDisplay,
          timestamp: date
        })
      } else {
      var docRef2 = this.afs.collection('chats').doc(id).collection('messages').doc(autoid);
      docRef2.set({
        message: message,
        remetente: this.primeiroNomeDisplay + " " + this.sobreNomeDisplay,
        remetenteuid: this.displayuid,
        timestamp: date,
        date: dataatual,
        time: currenttime,
        receptor: person,
        receptoruid: personuid
      })
      }
    })
    this.value = "";
  };

  refresh() {
    setTimeout(() => {
    }, 2000);
  }

  showMessages(Medico) {
    this.usuariomessage = [];
    let autoid = this.afs.createId()
    this.selecteduid = Medico;
    if (this.displayuid < Medico)
    {
      var id = this.displayuid + "" + Medico;
    } else {
      var id = Medico + "" + this.displayuid;
    }

    for (var i = 0; i < this.pacientedoc.length; i++)
    {
      if (this.pacientedoc[i].uid == this.selecteduid)
      {
        var MedicoNome = this.pacientedoc[i].medico;
        var MedicoEmail = this.pacientedoc[i].email;
      }
    }
    for (var i = 0; i < this.medicodoc.length; i++)
    {
      if (this.medicodoc[i].uid == this.selecteduid)
      {
        var MedicoNome = this.medicodoc[i].medico;
        var MedicoEmail = this.medicodoc[i].email;
      }

    }    

    this.selectedcompromisso = Medico;

    var docRef = this.afs.collection('chats').doc(this.displayuid).collection('chatswith').doc(this.selecteduid);
    docRef.get().toPromise().then((doc) => {
      if (doc.exists)
        {
          console.log("encontrado")!
        } else {
          console.log("Não encontrado!")
          var docRef2 = this.afs.collection('chats').doc(this.displayuid).collection('chatswith').doc(this.selecteduid);
          docRef2.set({
            user_uid: this.selecteduid,
            user_name: MedicoNome,
            user_email: MedicoEmail,
          })
          var docRef3 = this.afs.collection('chats').doc(this.selecteduid).collection('chatswith').doc(this.displayuid);
          docRef3.set({
            user_uid: this.displayuid,
            user_name: this.primeiroNomeDisplay + " " + this.sobreNomeDisplay,
            user_email: this.displayemail,
          })
          this.refresh()
          }
      })

    var docRef2 = this.afs.collection('chats').doc(id).collection('messages').doc(id);
    docRef2.get().toPromise().then((doc) => {
    if (doc.exists)
      {
        console.log("Encontrado")!
      } else {
        console.log("Não Encontrado!")

        var docRef2 = this.afs.collection('chats').doc(id).collection('messages').doc(id);
        docRef2.set({
          message: "",
        })
        this.refresh()
        }
    }) 
    
    this.afs.collection('chats').doc(id).collection('messages').valueChanges().subscribe(docs => {
    this.usuariomessage = [];
    docs.forEach(doc => {
      if (doc.remetenteuid == this.selecteduid || doc.receptoruid == this.selecteduid) {
        if (doc.remetenteuid == this.displayuid || doc.receptoruid == this.displayuid) {
        var test = {remetente: doc.remetente, receptor: doc.receptor, message: doc.message, time: doc.time, date: doc.date, timestamp: doc.timestamp, receptoruid: doc.receptoruid, remetenteuid: doc.remetenteuid}
        this.usuariomessage.push(test);
        this.usuariomessage = this.usuariomessage.sort((a, b) => a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0)
        }
      }
    });
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
}