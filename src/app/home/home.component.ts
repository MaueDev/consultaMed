import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ScheduleappointmentsComponent } from '../scheduleappointments/scheduleappointments.component';
import { MatTableDataSource } from '@angular/material';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { timer } from 'rxjs';
import { Router } from '@angular/router';

export interface userdoc {
  whom: string;
  date: string;
  time: string;
  status: string;
  appointment_id: string;
  timestamp: string;
}

export interface userapp {
  whom: string;
  date: string;
  time: string;
  status: string;
  appointment_id: string;
}

var ELEMENT_DATA: userapp[] = [
];

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  displayuid: string;
  firstNameDisplay: string;
  lastNameDisplay: string;
  displayemail: string;
  isDoctorDisplay: string;
  isDoctor: boolean;
  displayedColumns: string[] = ['whom', 'date', 'time', 'status', 'cancel', 'text', 'video'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);
  firstandlastname = this.lastNameDisplay + " " + this.firstNameDisplay;
  surname: string;
  doctors: string[] = [];
  patients: string[] = [];
  appointment_id: string;
  currentdate = this.datePipe.transform(new Date(), "M/dd/yyyy");
  appointmentdoc: userdoc[] = [];

  fileNameDialogRef: MatDialogRef<ScheduleappointmentsComponent>;

  constructor(
    public authService: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private snackbar: MatSnackBar,
    private route: Router,
  ) {
  }

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

    this.fetchuserdata()

    this.fetchappointments()
  }

  fetchuserdata() {
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
    }).catch(function (error) {
      console.log("Erro ao obter documento:", error);
    });
  }

  // Este método irá buscar todos os compromissos
  fetchappointments() {
    // Limpa a tabela ao atualizar ou voltar para a página.
    ELEMENT_DATA = [];
    this.appointmentdoc = [];
    this.dataSource = new MatTableDataSource(ELEMENT_DATA);

    // Loço para localizar e atualizar a página inicial com todos os compromissos relevantes para o usuário.
    const currentdate = this.datePipe.transform(new Date(), "M/dd/yyyy");
    this.afs.collection('appointments').get().toPromise()
      .then(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          // Import the current date and compare it to the current date.
          var date = this.datePipe.transform(doc.data().Date, "M/dd/yyyy");
          // Se o compromisso estiver desatualizado, exclua-o.
          if (date < currentdate) {
            this.afs.collection('appointments').doc(doc.data().appointment_id).delete().then(function () {
              console.log("Documentos desatualizados encontrados e excluídos.");
            }).catch(function (error) {
              console.error("Erro ao remover documento: ", error);
            });
            // Se o documento não estiver desatualizado, adicione-o à lista para o usuário ver.
          } else {
            // Se você é o remetente
            var apptstatus = "Cancelado"
            if (doc.data().senderuid == this.displayuid) {
              if (doc.data().isActive == true) {
                apptstatus = "Ativo"
              }
              if (this.isDoctor == false) {
                var test = { whom: "Dr(a). " + doc.data().receiver, date: date, time: doc.data().Time, status: apptstatus, appointment_id: doc.data().appointment_id, timestamp: doc.data().timestamp };
              } else {
                var test = { whom: "" + doc.data().receiver, date: date, time: doc.data().Time, status: apptstatus, appointment_id: doc.data().appointment_id, timestamp: doc.data().timestamp };
              }
              this.appointmentdoc.push(test);
            }
            // Se você é o que recebe
            if (doc.data().receiveruid == this.displayuid) {
              if (doc.data().isActive == true) {
                apptstatus = "Ativo"
              }
              if (this.isDoctor == true) {
                var test = { whom: "" + doc.data().sender, date: date, time: doc.data().Time, status: apptstatus, appointment_id: doc.data().appointment_id, timestamp: doc.data().timestamp };
              } else {
                var test = { whom: "Dr(a). " + doc.data().sender, date: date, time: doc.data().Time, status: apptstatus, appointment_id: doc.data().appointment_id, timestamp: doc.data().timestamp };
              }
              this.appointmentdoc.push(test);
            }
          }
        });
        this.appointmentdoc = this.appointmentdoc.sort((a, b) => a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0)
        for (var i = 0; i < this.appointmentdoc.length; i++) {
          ELEMENT_DATA.push(this.appointmentdoc[i])
          this.dataSource = new MatTableDataSource(ELEMENT_DATA);
        }
      });
  }

  refresh() {
    this.fetchappointments();
  }

  openAddFileDialog() {
    if (!(this.firstNameDisplay == null || this.lastNameDisplay == null || this.firstNameDisplay == "" || this.lastNameDisplay == "")) {
      this.fileNameDialogRef = this.dialog.open(ScheduleappointmentsComponent);
    } else {
      this.snackbar.open("Por favor, adicione um nome e/ou sobrenome em 'Meu Perfil' antes de agendar uma consulta!", 'Fechar', { duration: 3000 });
    }
  }

  // Este será o botão que vai para o compromisso aberto atual.,
  goToVideoAppointment() {
    this.route.navigate(['/videocall']);
  }

  goToTextAppointment() {
    this.route.navigate(['/chatbox']);
  }

  // Este método cancela o compromisso atual selecionado.
  async cancelAppointment(whom, date, time, status) {
    for (var i = 0; i < ELEMENT_DATA.length; i++) {
      if (ELEMENT_DATA[i].whom == whom && ELEMENT_DATA[i].date == date && ELEMENT_DATA[i].time == time && ELEMENT_DATA[i].status == status) {
        this.afs.collection('appointments').doc(ELEMENT_DATA[i].appointment_id).update({
          isActive: false,
        }).catch(function (error) {
          console.error("Erro ao remover documento: ", error);
        });
      }
    }
  }

  isMenuOpen = true;
  contentMargin = 240;

  onToolbarMenuToggle() {
    console.log('Na toolbar toggled', this.isMenuOpen);
    this.isMenuOpen = !this.isMenuOpen;

    if (!this.isMenuOpen) {
      this.contentMargin = 70;
    } else {
      this.contentMargin = 240;
    }
  }
}
