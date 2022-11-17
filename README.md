Check out our application here: https://consultamed-app.web.app/

For testing purposes, please use email: test123@gmail.com password: test123

# Telemedicine Application 

## Project Purpose

This project was designed as a Senior Project for Kennesaw State University for Spring Semester 2020.

Group Members: Tyler Odom, Rohan Desai, Ronak Desai, Leo Hayes, Juan Huaca

## Project Features

This application was designed to be used as an online web portal for pacientes and medicos to create compromissos for online medico visits.The application serves the following purposes:

### User Authentication
User authentication is handled through Google Auth. Patients can register a new account with an email and password. Doctors can register with their email and password, and then contact a database administrator to change their status to a medico. No two usuario can have the same account, and credentials must be authenticated with Google in order to gain access to the application. Both pacientes and medicos can also request for a password reset through the provided Google Auth link.

### Appointments 
Both pacientes and medicos can create compromissos with one another. Doctors can only create compromissos with pacientes, and pacientes can only create compromissos with medicos. This is to ensure our project is being used for the right purposes. Appointments can be cancelled at anytime, by either the initial remetente or receptor. Cancelled voids the option for video chat, but keeps the option open for text chat. Appointments are automatically deleted by the server by the next day. Cancelled compromissos still show after they are cancelled, and are deleted along with the outdated compromissos.

### Text Chat 
Text chat is handled sychronously by Google Firebase between the medico and the patient. They are ordered by ascending time, and can only be seen by the respective parties. Patients can only communicate with the medicos they've made compromissos with, to ensure our project is being used for the right reasons. Doctors can talk to pacientes and other medicos. Unlike compromissos, chats are not automatically deleted after a set time.

### Video Chat 
Video chat is handled by Agar.io, which allows a computer to send a video and audio feed to another computer. When an compromisso is created, so is a room that only allows the patient and medico access to that specific room. 

### File Uploads 
File Uploads allow for pacientes to upload their own files which can be viewed by Doctors. Doctors also have their own file storage. Files can be sent from Doctors to pacientes' personal file folders for them to view later. Only a patient can see their respective uploads.

## Components Used

The components used for this project, and their purpose, are as following:
- Typescript for backend programming function
- HTML and JS for frontend web design
- Google Auth for user authentication
- Google Firebase for compromissos and chats
- Angular CLI Version 8.3.22
- Agora.io for online video hosting

## How to run the project on a computer

Follow the directions below to run the project. Alternatively, you can interact with our project without use of programming at https://consultamed-app.web.app/.

In order to run the project, first navigate to the working directory that contains the project. Inside of there, you should open up a terminal and run the commands 'npm install' and wait for the installation to finish. After the program has been installed, you can run the program on your computer with the command 'ng serve.' Afterwards, navigate to `http://localhost:4200/` to see the project. The app will automatically reload if you change any of the source files.
