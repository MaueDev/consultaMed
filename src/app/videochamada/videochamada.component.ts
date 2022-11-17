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
  medico: string;
  email: string;
  uid: string;
}

interface userGroup {
  _categoria: string;
  _allUsuario: any;
}

@Component({
  selector: 'app-videochamada',
  templateUrl: './videochamada.component.html',
  styleUrls: ['./videochamada.component.css']
})
export class VideocallComponent implements OnInit {

  displayuid: string;
  displayemail: string;
  primeiroNomeDisplay: string;
  sobreNomeDisplay: string;
  isMedicoDisplay: string;
  vulgo: string;
  isMedico: boolean;
  medicodoc: userdoc[] = [];
  pacientedoc: userdoc[] = [];
  compromissodoc: userdoc[] = [];
  checkbool: boolean;
  flag: boolean;
  selectedcompromisso: string;
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
      _categoria: 'Appointments With',
      _allUsuario: this.compromissodoc,
    },
    {
      _categoria: 'Medico',
      _allUsuario: this.medicodoc,
    },
    {
      _categoria: 'Patient',
      _allUsuario: this.pacientedoc,
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
    this.buscarDadosUsuario()

    // Atualiza doutordoc
    this.updateMedicoPaciente()

    // Atualizar compromissos
    this.updateCompromissos()

    this.checkAppointmentString();

    this.client = this.ngxAgoraService.createClient({ mode: 'rtc', codec: 'h264' });
    this.assignClientHandlers();

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


    this.localStream.on(StreamEvent.MediaAccessDenied, () => {
      console.log('acesso negado');
    });
  }

  private initLocalStream(onSuccess?: () => any): void {
    this.localStream.init(
      () => {
      
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

  buscarDadosUsuario() {
    // Retrieve user data
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
                var test = { medico: doc.data().primeiroNome + " " + doc.data().sobrenome, email: doc.data().email, uid: doc.data().uid }
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
                var test = { medico: doc.data().primeiroNome + " " + doc.data().sobrenome, email: doc.data().email, uid: doc.data().uid }
                this.pacientedoc.push(test);
              }
            }
          }
        }
        );
      });
  }

// Este método atualiza a lista de seleção na página de bate-papo com as pessoas com quem você tem compromissos.
  updateCompromissos() {
    this.afs.collection('compromissos').get().toPromise()
      .then(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          this.checkbool = true;
          // Se o documento atual tiver o uid do usuário como remetente ou destinatário.
          if (this.displayuid == doc.data().remetenteuid) {
            for (var i = 0; i < this.compromissodoc.length; i++) {
              if (this.compromissodoc[i].uid == doc.data().receptoruid) {
                this.checkbool = false;
              }
            }
            if (this.checkbool == true) {
              var test = { medico: doc.data().receptor, email: doc.data().receptoremail, uid: doc.data().receptoruid }
              this.compromissodoc.push(test);
            }
          }
          if (this.displayuid == doc.data().receptoruid) {
            for (var i = 0; i < this.compromissodoc.length; i++) {
              if (this.compromissodoc[i].uid == doc.data().remetenteuid) {
                this.checkbool = false;
              }
            }
            if (this.checkbool == true) {
              var test = { medico: doc.data().remetente, email: doc.data().remetenteemail, uid: doc.data().remetenteuid }
              this.compromissodoc.push(test);
            }
          }
        });
      })
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

  refresh() {
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

}
