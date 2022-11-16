import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import {FormControl} from '@angular/forms';


export interface userdoc {
  doctor: string;
  email: string;
  uid: string;
}

interface userGroup {
  _category: string;
  _allUsers: any;
}

export interface usermessage {
  date: any;
  message: any;
  receiver: any;
  receiveruid: string;
  sender: string;
  senderuid: string;
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
  firstNameDisplay: string;
  lastNameDisplay: string;
  isDoctorDisplay: string;
  surname: string;
  isDoctor: boolean;
  doctordoc:userdoc[] = [];
  patientdoc:userdoc[] = [];
  appointmentdoc:userdoc[] = [];
  checkbool: boolean;
  flag: boolean;
  selectedappointment: string;
  expenses: any;
  books: any;
  value: any;
  selecteduid: string;
  noappt: boolean;
  messagebool: boolean;

  usermessage: usermessage[] = [
  ];

  messagedoc: usermessage[] = [
  ];

  messagewithdoc: userdoc[] = [
  ];
 
  userControl = new FormControl();
  doctoruserGroups: userGroup[] = [
    {
      _category: 'Compromissos com',
      _allUsers: this.appointmentdoc,
    },
    {
      _category: 'Mensagens com',
      _allUsers: this.messagewithdoc,
    },
    {
      _category: 'Todos Médicos',
      _allUsers: this.doctordoc,
    },
    {
      _category: 'Todos Pacientes',
      _allUsers: this.patientdoc,
    },
  ];

  patientuserGroups: userGroup[] = [
    {
      _category: 'Compromissos com',
      _allUsers: this.appointmentdoc,
    },
    {
      _category: 'Mensagens com',
      _allUsers: this.messagewithdoc,
    },
  ];


  constructor(
    public authService: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,   // Inject Firestore service
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
    // Fetch user's data
    this.fetchuserdata()

    // Atualiza doutordoc
    this.updateDoctorsPatients()

    // Atualizar compromissos
    this.updateappointments()

    this.updateMessages()

  }

  fetchuserdata() {
    // Retrieve user data
    var docRef = this.afs.collection('users').doc(this.displayuid);
    docRef.get().toPromise().then((doc) => {
      if (doc.exists) {
          this.firstNameDisplay = doc.data().firstName;
          this.lastNameDisplay = doc.data().lastName;
          if (doc.data().isDoctor == true) {
            this.isDoctorDisplay = "Médico(a)";
            this.surname = "Dr(a). "
            this.isDoctor = true;
          } else {
            this.isDoctorDisplay = "Paciente";
            this.isDoctor = false;
          }
      } else {
          console.log("Não há documento!");
      }
  }).catch(function(error) {
      console.log("Erro ao obter o documento:", error);
  });
  }

  // Este método atualiza a lista de seleção na página de bate-papo com médicos e pacientes.
  updateDoctorsPatients() {
    this.afs.collection('users').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
          // Se eles são médicos
          if (doc.data().isDoctor == true) {
            // e eles não são você
            if (doc.data().uid != this.displayuid) {
              // Remove todos os usuários sem nomes
              if (!(doc.data().firstName == null || doc.data().firstName == null || doc.data().firstName == "" || doc.data().lastName == "")) {
                // então imprime seu nome
                var test = {doctor: doc.data().firstName + " " + doc.data().lastName, email: doc.data().email, uid: doc.data().uid}
                this.doctordoc.push(test);
              }
            }
          }
          if (doc.data().isDoctor == false) {
            // e eles não são você
            if (doc.data().uid != this.displayuid) {
              // Remove todos os usuários sem nomes
              if (!(doc.data().firstName == null || doc.data().firstName == null || doc.data().firstName == "" || doc.data().lastName == "")) {
                // então imprime seu nome
                var test = {doctor: doc.data().firstName + " " + doc.data().lastName, email: doc.data().email, uid: doc.data().uid}
                this.patientdoc.push(test);
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
            var test = {doctor: doc.data().user_name, email: doc.data().user_email, uid: doc.data().user_uid};
            this.messagewithdoc.push(test);
            this.noappt = false;
          } else {
            this.noappt = true;
          }
      });
    });
    }

  // Este método atualiza a lista de seleção na página de bate-papo com as pessoas com quem você tem compromissos.
    updateappointments() {
      this.afs.collection('appointments').get().toPromise()
      .then(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          this.checkbool = true;
          // Se o documento atual tiver o uid do usuário como remetente ou destinatário.
          if (this.displayuid == doc.data().senderuid)
          {
            for (var i = 0; i < this.appointmentdoc.length; i++) {
              if (this.appointmentdoc[i].uid == doc.data().receiveruid)
                {
                  this.checkbool = false;
                }
              }
            if (this.checkbool == true)
              {
                var test = {doctor: doc.data().receiver, email: doc.data().receiveremail, uid: doc.data().receiveruid}
                this.appointmentdoc.push(test);
              }
              } 
          if (this.displayuid == doc.data().receiveruid)
          {
            for (var i = 0; i < this.appointmentdoc.length; i++) {
              if (this.appointmentdoc[i].uid == doc.data().senderuid)
                {
                  this.checkbool = false;
                }
              }
            if (this.checkbool == true)
              {
                var test = {doctor: doc.data().sender, email: doc.data().senderemail, uid: doc.data().senderuid}
                this.appointmentdoc.push(test);
              }
              } 
      });
      if (this.noappt = true) {
        if (this.appointmentdoc.length == 0)
        {
          if (this.isDoctor == false)
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
    if (this.appointmentdoc.length == 0) {
      this.snackbar.open("Nenhum compromisso encontrado para o usuário atual. Agende um horário para conversarmos.", 'Fechar', {duration: 10000});
    }
  }

  sendMessage(message) {
    var date = new Date();
    var currenttime = this.datePipe.transform(new Date(), "h:mm a")
    var currentdate = this.datePipe.transform(new Date(), "M/dd/yyyy")
    var personuid = this.selectedappointment;
    var message = message; 
    for (var i = 0; i < this.appointmentdoc.length; i++) {
      if (this.appointmentdoc[i].uid == personuid)
        {
        var person = this.appointmentdoc[i].doctor;
        }
    }
    if (person == undefined) {
      for (var i = 0; i < this.doctordoc.length; i++) {
        if (this.doctordoc[i].uid == personuid)
          {
          var person = this.doctordoc[i].doctor;
          }
      }
    }
    if (person == undefined) {
      for (var i = 0; i < this.patientdoc.length; i++) {
        if (this.patientdoc[i].uid == personuid)
          {
          var person = this.patientdoc[i].doctor;
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
          from: this.firstNameDisplay + " " + this.lastNameDisplay,
          timestamp: date
        })
      } else {
      var docRef2 = this.afs.collection('chats').doc(id).collection('messages').doc(autoid);
      docRef2.set({
        message: message,
        sender: this.firstNameDisplay + " " + this.lastNameDisplay,
        senderuid: this.displayuid,
        timestamp: date,
        date: currentdate,
        time: currenttime,
        receiver: person,
        receiveruid: personuid
      })
      }
    })
    this.value = "";
  };

  refresh() {
    setTimeout(() => {
    }, 2000);
  }

  showMessages(Doctor) {
    this.usermessage = [];
    let autoid = this.afs.createId()
    this.selecteduid = Doctor;
    if (this.displayuid < Doctor)
    {
      var id = this.displayuid + "" + Doctor;
    } else {
      var id = Doctor + "" + this.displayuid;
    }

    for (var i = 0; i < this.patientdoc.length; i++)
    {
      if (this.patientdoc[i].uid == this.selecteduid)
      {
        var DoctorName = this.patientdoc[i].doctor;
        var DoctorEmail = this.patientdoc[i].email;
      }
    }
    for (var i = 0; i < this.doctordoc.length; i++)
    {
      if (this.doctordoc[i].uid == this.selecteduid)
      {
        var DoctorName = this.doctordoc[i].doctor;
        var DoctorEmail = this.doctordoc[i].email;
      }

    }    

    this.selectedappointment = Doctor;

    var docRef = this.afs.collection('chats').doc(this.displayuid).collection('chatswith').doc(this.selecteduid);
    docRef.get().toPromise().then((doc) => {
      if (doc.exists)
        {
          console.log("Found")!
        } else {
          console.log("Not Found!")
          var docRef2 = this.afs.collection('chats').doc(this.displayuid).collection('chatswith').doc(this.selecteduid);
          docRef2.set({
            user_uid: this.selecteduid,
            user_name: DoctorName,
            user_email: DoctorEmail,
          })
          var docRef3 = this.afs.collection('chats').doc(this.selecteduid).collection('chatswith').doc(this.displayuid);
          docRef3.set({
            user_uid: this.displayuid,
            user_name: this.firstNameDisplay + " " + this.lastNameDisplay,
            user_email: this.displayemail,
          })
          this.refresh()
          }
      })

    var docRef2 = this.afs.collection('chats').doc(id).collection('messages').doc(id);
    docRef2.get().toPromise().then((doc) => {
    if (doc.exists)
      {
        console.log("Found")!
      } else {
        console.log("Not Found!")
        //var docRef3 = this.afs.collection('chats').doc(id);
        //docRef3.set({
          //initialsender: this.displayuid
        //})
        var docRef2 = this.afs.collection('chats').doc(id).collection('messages').doc(id);
        docRef2.set({
          message: "",
        })
        this.refresh()
        }
    }) 
    
    // Activate Listener
    this.afs.collection('chats').doc(id).collection('messages').valueChanges().subscribe(docs => {
    // Clear the message list when there is a new message added, updated or deleted.
    this.usermessage = [];
    // Put all of the remaining documents in the message list.
    docs.forEach(doc => {
      if (doc.senderuid == this.selecteduid || doc.receiveruid == this.selecteduid) {
        if (doc.senderuid == this.displayuid || doc.receiveruid == this.displayuid) {
        var test = {sender: doc.sender, receiver: doc.receiver, message: doc.message, time: doc.time, date: doc.date, timestamp: doc.timestamp, receiveruid: doc.receiveruid, senderuid: doc.senderuid}
        this.usermessage.push(test);
        this.usermessage = this.usermessage.sort((a, b) => a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0)
        }
      }
    /*// Activate Listener (Old switching method)
    this.afs.collection('chats').doc(id).collection('messages').valueChanges().subscribe(docs => {
      // Clear the message list when there is a new message added, updated or deleted.
      this.usermessage = [];
      // Put all of the remaining documents in the message list.
      docs.forEach(doc => {
        var test = {sender: doc.sender, receiver: doc.receiver, message: doc.message, time: doc.time, date: doc.date, timestamp: doc.timestamp, receiveruid: doc.receiveruid, senderuid: doc.senderuid}
        this.usermessage.push(test);
        this.usermessage = this.usermessage.sort((a, b) => a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0)
      });
    }); */
    });
  });
  }

  isMenuOpen = true;
  contentMargin = 240;

  onToolbarMenuToggle() {
    console.log('On toolbar toggled', this.isMenuOpen);
    this.isMenuOpen = !this.isMenuOpen;

    if (!this.isMenuOpen) {
      this.contentMargin = 70;
    } else {
      this.contentMargin = 240;
    }
  }
}