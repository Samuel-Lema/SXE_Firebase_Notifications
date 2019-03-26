// imports
const express = require('express');
const app = express();
const bodyParser = require('body-parser');


// inicializamos la conexion con firebase
// necesitamos json con las credenciales

var admin = require('firebase-admin');

var serviceAccount = require('./dbfirebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mydatabase-dca18.firebaseio.com"
});

//Base de datos

var db = admin.database();
var ref = db.ref("/");

//Para guardar el resultado de la base
var resultado = null;

//Listener Base de datos que se actualiza en tiempo real

ref.on("value", function(snapshot) {
    
    resultado = snapshot;
    
    // Variables de uso en las notificaciones
    let usuario = ""
    let msg = ""
    
    // Recorro todos los mensajes y guardo el último para enviarlo por broadcast a todos
    resultado.forEach(element => {

        if (element.key == "mensajes") {
                    
            element.forEach(elementChild => {

                // Guardo el usuario que mando el mensaje
                usuario = elementChild.val().tokenUsuario
                // Guardo el mensaje
                msg = elementChild.val().mensaje
            });
        }
    });
    
    // Recorro todos los usuarios/dispositivos para enviarles el nuevo mensaje
    resultado.forEach(element => {
        
        if (element.key == "dispositivos") {
                    
            element.forEach(elementChild => {
                       
                // Envia a todos los usuarios que no sean el que envio el mensaje
                if (elementChild.val().username != usuario) {
                    
                    var registrationToken =  elementChild.key;

                    // Creamos el cuerpo de la notificación
                    var message = {
                    
                        //Mensaje de la notificación
                        notification:{
                            "title":usuario,
                            "body": msg 
                        },
                
                        token: registrationToken
                    };

                    //Envío de la notificación
                    admin.messaging().send(message)
                        .then((response) => {
                            // Response is a message ID string.
                            console.log('Mensaje enviado correctamente a' + elementChild.val().username + ':', response);
                        })
                        .catch((error) => {
                            console.log('Error enviando el mensaje a' + elementChild.val().username + ':', error);
                        });
                    
                }       
            });
        }
    });
    
    
}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});


app.listen(8080, () => {
    console.log('Servidor web iniciado');
});