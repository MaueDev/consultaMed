import { Component, OnInit } from '@angular/core';
import { NgxAgoraService, Stream, AgoraClient, ClientEvent, StreamEvent } from 'ngx-agora';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from '../auth.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';

export interface userdoc {
  doctor: string;
  email: string;
  uid: string;
}

interface userGroup {
  _category: string;
  _allUsers: any;
}

@Component({
  selector: 'app-videocall',
  templateUrl: './videocall.component.html',
  styleUrls: ['./videocall.component.css']
})
export class VideocallComponent implements OnInit {

  displayuid: string;
  displayemail: string;
  firstNameDisplay: string;
  lastNameDisplay: string;
  isDoctorDisplay: string;
  surname: string;
  isDoctor: boolean;
  doctordoc: userdoc[] = [];
  patientdoc: userdoc[] = [];
  appointmentdoc: userdoc[] = [];
  checkbool: boolean;
  flag: boolean;
  selectedappointment: string;
  expenses: any;
  books: any;
  value: any;
  selecteduid: string;
  checkAstring: string;
  checkAnumD: number = 0;
  checkAnumP: number = 0;

  localCallId = 'agora_local';
  remoteCalls: string[] = [];

  private client: AgoraClient;
  private localStream: Stream;

  private uid: any;
  private gen_uid: any;

  audioEnabled: boolean = true;
  videoEnabled: boolean = true;

  userControl = new FormControl();
  userGroups: userGroup[] = [
    {
      _category: 'Appointments With',
      _allUsers: this.appointmentdoc,
    },
    {
      _category: 'Doctor',
      _allUsers: this.doctordoc,
    },
    {
      _category: 'Patient',
      _allUsers: this.patientdoc,
    },
  ];

  constructor(
    public authService: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,   // Injeta o serviço Firestore
    private ngxAgoraService: NgxAgoraService,
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
    // Busca os dados do usuário
    this.fetchuserdata()

    // Atualiza doutordoc
    this.updateDoctorsPatients()

    // Atualizar compromissos
    this.updateappointments()

    this.checkAppointmentString();

    this.client = this.ngxAgoraService.createClient({ mode: 'rtc', codec: 'h264' });
    this.assignClientHandlers();

    // Adicionado nesta etapa para inicializar o fluxoA/V stream
    // this.localStream = this.ngxAgoraService.createStream({ streamID: this.uid, audio: true, video: true, screen: false });
    // this.assignLocalStreamHandlers();
    // this.initLocalStream(() => this.join(uid => this.publish(), error => console.error(error)));
  }

  createVideoStream(vUid) {
    if (this.displayuid < vUid) {
      this.gen_uid = this.displayuid + vUid;
    } else {
      this.gen_uid = vUid + this.displayuid;
    }
    var finalUID = this.gen_uid;

    this.localStream = this.ngxAgoraService.createStream({ streamID: this.gen_uid, audio: true, video: true, screen: false });
    this.assignLocalStreamHandlers();
    this.initLocalStream(() => this.join(finalUID => this.publish(), error => console.error(error)));
  }

  /**
 * Tenta se conectar a uma sala de bate-papo online onde os usuários podem hospedar e receber fluxos A/V.
 */
  join(onSuccess?: (uid: number | string) => void, onFailure?: (error: Error) => void): void {
    this.client.join(null, this.gen_uid, this.uid, onSuccess, onFailure);
  }

  /**
   * Tenta fazer upload do fluxo A/V local criado para uma sala de bate-papo ingressada.
   */
  publish(): void {
    this.client.publish(this.localStream, err => console.log('Publicar erro de stream local: ' + err));
  }

  private assignClientHandlers(): void {
    this.client.on(ClientEvent.LocalStreamPublished, evt => {
      console.log('Publicado stream local com sucesso');
    });

    this.client.on(ClientEvent.Error, error => {
      console.log('Mensagem de erro:', error.reason);
      if (error.reason === 'DYNAMIC_KEY_TIMEOUT') {
        this.client.renewChannelKey(
          '',
          () => console.log('A channel key foi renovada com sucesso.'),
          renewError => console.error('Falha na renovação da channel key : ', renewError)
        );
      }
    });

    this.client.on(ClientEvent.RemoteStreamAdded, evt => {
      const stream = evt.stream as Stream;
      this.client.subscribe(stream, { audio: true, video: true }, err => {
        console.log('Falha na transmissão', err);
      });
    });

    this.client.on(ClientEvent.RemoteStreamSubscribed, evt => {
      const stream = evt.stream as Stream;
      const id = this.getRemoteId(stream);
      if (!this.remoteCalls.length) {
        this.remoteCalls.push(id);
        setTimeout(() => stream.play(id), 1000);
      }
    });

    this.client.on(ClientEvent.RemoteStreamRemoved, evt => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = [];
        console.log(`O fluxo remoto foi removido ${stream.getId()}`);
      }
    });

    this.client.on(ClientEvent.PeerLeave, evt => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = this.remoteCalls.filter(call => call !== `${this.getRemoteId(stream)}`);
        console.log(`${evt.uid} saiu deste canal`);
      }
    });
  }

  private getRemoteId(stream: Stream): string {
    return `agora_remote-${stream.getId()}`;
  }

  // Added in this step
  private assignLocalStreamHandlers(): void {
    this.localStream.on(StreamEvent.MediaAccessAllowed, () => {
      console.log('acesso permitido');
    });

    // The user has denied access to the camera and mic.
    this.localStream.on(StreamEvent.MediaAccessDenied, () => {
      console.log('acesso negado');
    });
  }

  private initLocalStream(onSuccess?: () => any): void {
    this.localStream.init(
      () => {
        // The user has granted access to the camera and mic.
        this.localStream.play(this.localCallId);
        if (onSuccess) {
          onSuccess();
        }
      },
      err => console.error('getUserMedia falhou', err)
    );
  }

  leave() {
    this.client.leave(() => {
      this.localStream.stop();
      document.getElementById('agora_local').innerHTML = "";
      console.log("Sucesso ao sair do canal");
    }, (err) => {
      console.log("Falha ao sair do canal");
    });
  }

  toggleAudio() {
    this.audioEnabled = !this.audioEnabled;
    if (this.audioEnabled) this.localStream.enableAudio();
    else this.localStream.disableAudio();
  }

  toggleVideo() {
    this.videoEnabled = !this.videoEnabled;
    if (this.videoEnabled) this.localStream.enableVideo();
    else this.localStream.disableVideo();
  }

  checkAppointmentString() {
    setTimeout(() => {
      if (this.checkAnumD == 0 && this.checkAnumP == 0) {
        this.checkAstring = "Agendar Consulta para o Vídeo Chamada";
      }
      else if (this.checkAnumD > 0 || this.checkAnumP > 0) {
        this.checkAstring = "";
      }
    }, 500);
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
    }).catch(function (error) {
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
                var test = { doctor: doc.data().firstName + " " + doc.data().lastName, email: doc.data().email, uid: doc.data().uid }
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
                var test = { doctor: doc.data().firstName + " " + doc.data().lastName, email: doc.data().email, uid: doc.data().uid }
                this.patientdoc.push(test);
              }
            }
          }
        }
        );
      });
  }

// Este método atualiza a lista de seleção na página de bate-papo com as pessoas com quem você tem compromissos.
  updateappointments() {
    this.afs.collection('appointments').get().toPromise()
      .then(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          this.checkbool = true;
          // Se o documento atual tiver o uid do usuário como remetente ou destinatário.
          if (this.displayuid == doc.data().senderuid) {
            for (var i = 0; i < this.appointmentdoc.length; i++) {
              if (this.appointmentdoc[i].uid == doc.data().receiveruid) {
                this.checkbool = false;
              }
            }
            if (this.checkbool == true) {
              var test = { doctor: doc.data().receiver, email: doc.data().receiveremail, uid: doc.data().receiveruid }
              this.appointmentdoc.push(test);
            }
          }
          if (this.displayuid == doc.data().receiveruid) {
            for (var i = 0; i < this.appointmentdoc.length; i++) {
              if (this.appointmentdoc[i].uid == doc.data().senderuid) {
                this.checkbool = false;
              }
            }
            if (this.checkbool == true) {
              var test = { doctor: doc.data().sender, email: doc.data().senderemail, uid: doc.data().senderuid }
              this.appointmentdoc.push(test);
            }
          }
        });
      })
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

  refresh() {
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

}
