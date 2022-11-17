import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import {MatTableDataSource} from '@angular/material';
import { MatMenuModule} from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';

export interface FileList {
  name: string;
  download: string;
  user: string;
  fileid: string;
  action: string;
}



export interface PickToSend {
  _uid: string;
  _name: string;
  _sobreNome: string;
  _email: string;
}

var FILE_DATA: FileList[] = [
  
];



@Component({
  selector: 'app-meusarquivos',
  templateUrl: './meusarquivos.component.html',
  styleUrls: ['./meusarquivos.component.css']
})


export class MeuArquivosComponent implements OnInit {
  displayedColumns: string[] = ['name', 'action','download','delete'];
  PickToSend:PickToSend[] = [];
  dataSource = new MatTableDataSource(FILE_DATA);
  displayemail: string;
  selectedFile: File;
  isMedicoDisplay:string;
  primeiroNomeDisplay: string;
  sobreNomeDisplay: string;
  displayuid: string;
  filename: string;
  FileID: string;
  _file: string;
  _download: string;
  _user: string;
  _fileid: string;
  _action: string;
  test: any;
  vulgo: string;
  isMedico: boolean;

	filenameSend: string;
  
  selectedValue: string;

  constructor(
    public authService: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,   
  ) { }

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
      this.displayemail = this.afAuth.auth.currentUser.email;
      localStorage.setItem("displayemail", this.displayemail);
      console.log(this.displayemail);
    } catch (error) {
      this.displayemail = localStorage.getItem("displayemail");
      console.log(this.displayemail);
    }

    
    this.buscarDadosUsuario();

    
    this.listFiles();

    
    this.fetchUsers();

    var docRef = this.afs.collection('usuario').doc(this.displayuid);
      docRef.get().toPromise().then((doc) => {
        if (doc.exists) {
            if (doc.data().isMedico) {
              document.getElementById("docsf").style.display = "block";
            }
        } else {
            console.log("Não há documento!");
        }
    }).catch(function(error) {
        console.log("Erro ao obter o documento:", error);
    });


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
            this.isMedico = false;
            this.isMedicoDisplay = "Paciente";
          }
      } else {
          console.log("Não há documento!");
      }
  }).catch(function(error) {
      console.log("Erro ao obter o documento:", error);
  });
  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0]
  }


  fetchUsers() {
    this.afs.collection('usuario').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        if(this.isMedicoDisplay == "Médico(a)"){
          if(doc.exists){
            var test = {_uid: doc.data().uid, _name: doc.data().primeiroNome, _sobreNome: doc.data().sobrenome, _email: doc.data().email}
            this.PickToSend.push(test);
          }
        }
      });
    });
  }

  onUpload() {
    this.filename = this.selectedFile.name;
    var storageRef = firebase.storage().ref(this.afAuth.auth.currentUser.uid + '/' + this.filename);
    var uploadTask = storageRef.put(this.selectedFile);
    uploadTask.then((snapshot) => {
      snapshot.ref.getDownloadURL().then((url) => {
        let id = this.afs.createId()
        this.afs.collection('files').doc(id).set({
          Name: this.filename,
          Download: url,
          User: this.displayuid,
          Action: this.displayemail,
          FileID: id,
        });
        
      });
  });
  }

  onSend() {
    this.filenameSend = this.selectedFile.name;
    var storageRef = firebase.storage().ref(this.selectedValue + '/' + this.filenameSend);
    var uploadTask = storageRef.put(this.selectedFile);
    uploadTask.then((snapshot) => {
      snapshot.ref.getDownloadURL().then((url) => {
        let id = this.afs.createId()
        this.afs.collection('files').doc(id).set({
          Name: this.filenameSend,
          Download: url,
          User: this.selectedValue,
          Action: this.displayemail,
          FileID: id,
        });
        
      });
  });
  }

  onDelete(name, user, download, fileid) {

        for (var i = 0; i < FILE_DATA.length; i++) {
          if(FILE_DATA[i].name == name && FILE_DATA[i].download == download && FILE_DATA[i].user == user && FILE_DATA[i].fileid == fileid){
            this.afs.collection('files').doc(FILE_DATA[i].fileid).delete().then(function() {
              console.log("Arquivo encontrado e excluído no banco de dados");
            }).catch(function(error) {
              console.error("Erro ao remover documento: ", error);
            });
            firebase.storage().ref(FILE_DATA[i].user + '/' + FILE_DATA[i].name).delete().then(function() {
              console.log("Arquivo encontrado e excluído no armazenamento");
            }).catch(function(error) {
              console.error("Erro ao remover documento: ", error);
            });
          }
        }
  }

  listFiles()
  {
    FILE_DATA = [];
    this.dataSource = new MatTableDataSource(FILE_DATA);    
    this.afs.collection('files').get().toPromise()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        this.afs.collection('files').doc(doc.data().FileID).get().toPromise().then((doc) => {
          if(this.isMedicoDisplay == "Médico(a)"){
            if(doc.exists) {
              this._file = doc.data().Name;
              this._action = doc.data().Action;
              this._download = doc.data().Download;
              this._fileid = doc.data().FileID;
              this._user = doc.data().User;
              this.test = {name: this._file, action: this._action, download: this._download, user:this._user, fileid:this._fileid}
              FILE_DATA.push(this.test);
              this.dataSource = new MatTableDataSource(FILE_DATA);
            }
          }
          else if(doc.exists && doc.data().User == this.displayuid){
            this._file = doc.data().Name;
            this._action = doc.data().Action;
            this._download = doc.data().Download;
            this._fileid = doc.data().FileID;
            this._user = doc.data().User;
            this.test = {name: this._file, action: this._action, download: this._download, user:this._user, fileid:this._fileid}
            FILE_DATA.push(this.test);
            this.dataSource = new MatTableDataSource(FILE_DATA);
          }
          
        }
      );
    });
  });
}



refresh() { 
  setTimeout(() => {
    this.listFiles();
  }, 2000); 
}

downloadFiles() {
  
var storageRef = firebase.storage().ref(this.afAuth.auth.currentUser.uid + '/' + "3d-Wallpapers.jpg");



storageRef.getDownloadURL().then(function(url) {
  
  console.log(url);
  window.open(url,'_blank');

}).catch(function(error) {

  switch (error.code) {
    case 'storage/object-not-found':
      // Arquivo não existe
      break;
    case 'storage/unauthorized':
      // O usuário não tem permissão para acessar o objeto
      break;
    case 'storage/canceled':
      // O usuário cancelou o upload
      break;
    case 'storage/unknown':
      // Ocorreu um erro desconhecido, inspecione a resposta do servidor
      break;
  }
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
