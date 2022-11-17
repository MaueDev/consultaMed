import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ComponenteAgendarCompromissos } from '../agendarcompromissoss/ComponenteAgendarCompromissos.component';
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
  compromisso_id: string;
  timestamp: string;
}

export interface userapp {
  whom: string;
  date: string;
  time: string;
  status: string;
  compromisso_id: string;
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
  primeiroNomeDisplay: string;
  sobreNomeDisplay: string;
  displayemail: string;
  isMedicoDisplay: string;
  isMedico: boolean;
  displayedColumns: string[] = ['whom', 'date', 'time', 'status', 'cancel', 'text', 'video'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);
  firstandlastname = this.sobreNomeDisplay + " " + this.primeiroNomeDisplay;
  vulgo: string;
  medicos: string[] = [];
  pacientes: string[] = [];
  compromisso_id: string;
  dataatual = this.datePipe.transform(new Date(), "dd/M/yyyy");
  compromissodoc: userdoc[] = [];

  fileNameDialogRef: MatDialogRef<ComponenteAgendarCompromissos>;

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

    this.buscarDadosUsuario()

    this.fetchcompromissos()
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
    }).catch(function (error) {
      console.log("Erro ao obter documento:", error);
    });
  }

  // Este método irá buscar todos os compromissos
  fetchcompromissos() {
    // Limpa a tabela ao atualizar ou voltar para a página.
    ELEMENT_DATA = [];
    this.compromissodoc = [];
    this.dataSource = new MatTableDataSource(ELEMENT_DATA);

    // Loço para localizar e atualizar a página inicial com todos os compromissos relevantes para o usuário.
    const dataatual = this.datePipe.transform(new Date(), "dd/M/yyyy");
    this.afs.collection('compromissos').get().toPromise()
      .then(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          // Import the current date and compare it to the current date.
          var date = this.datePipe.transform(doc.data().Date, "dd/M/yyyy");
          // Se o compromisso estiver desatualizado, exclua-o.
          if (date < dataatual) {
            this.afs.collection('compromissos').doc(doc.data().compromisso_id).delete().then(function () {
              console.log("Documentos desatualizados encontrados e excluídos.");
            }).catch(function (error) {
              console.error("Erro ao remover documento: ", error);
            });
            // Se o documento não estiver desatualizado, adicione-o à lista para o usuário ver.
          } else {
            // Se você é o remetente
            var apptstatus = "Cancelado"
            if (doc.data().remetenteuid == this.displayuid) {
              if (doc.data().isActive == true) {
                apptstatus = "Ativo"
              }
              if (this.isMedico == false) {
                var test = { whom: "Dr(a). " + doc.data().receptor, date: date, time: doc.data().Time, status: apptstatus, compromisso_id: doc.data().compromisso_id, timestamp: doc.data().timestamp };
              } else {
                var test = { whom: "" + doc.data().receptor, date: date, time: doc.data().Time, status: apptstatus, compromisso_id: doc.data().compromisso_id, timestamp: doc.data().timestamp };
              }
              this.compromissodoc.push(test);
            }
            // Se você é o que recebe
            if (doc.data().receptoruid == this.displayuid) {
              if (doc.data().isActive == true) {
                apptstatus = "Ativo"
              }
              if (this.isMedico == true) {
                var test = { whom: "" + doc.data().remetente, date: date, time: doc.data().Time, status: apptstatus, compromisso_id: doc.data().compromisso_id, timestamp: doc.data().timestamp };
              } else {
                var test = { whom: "Dr(a). " + doc.data().remetente, date: date, time: doc.data().Time, status: apptstatus, compromisso_id: doc.data().compromisso_id, timestamp: doc.data().timestamp };
              }
              this.compromissodoc.push(test);
            }
          }
        });
        this.compromissodoc = this.compromissodoc.sort((a, b) => a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0)
        for (var i = 0; i < this.compromissodoc.length; i++) {
          ELEMENT_DATA.push(this.compromissodoc[i])
          this.dataSource = new MatTableDataSource(ELEMENT_DATA);
        }
      });
  }

  refresh() {
    this.fetchcompromissos();
  }

  openAddFileDialog() {
    if (!(this.primeiroNomeDisplay == null || this.sobreNomeDisplay == null || this.primeiroNomeDisplay == "" || this.sobreNomeDisplay == "")) {
      this.fileNameDialogRef = this.dialog.open(ComponenteAgendarCompromissos);
    } else {
      this.snackbar.open("Por favor, adicione um nome e/ou sobrenome em 'Meu Perfil' antes de agendar uma consulta!", 'Fechar', { duration: 3000 });
    }
  }

  // Este será o botão que vai para o compromisso aberto atual.,
  goToVideoAppointment() {
    this.route.navigate(['/videochamada']);
  }

  goToTextAppointment() {
    this.route.navigate(['/chatbox']);
  }

  // Este método cancela o compromisso atual selecionado.
  async cancelAppointment(whom, date, time, status) {
    for (var i = 0; i < ELEMENT_DATA.length; i++) {
      if (ELEMENT_DATA[i].whom == whom && ELEMENT_DATA[i].date == date && ELEMENT_DATA[i].time == time && ELEMENT_DATA[i].status == status) {
        this.afs.collection('compromissos').doc(ELEMENT_DATA[i].compromisso_id).update({
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
