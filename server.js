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
    
    let usuario = ""
    let msg = ""
    
    resultado.forEach(element => {

        if (element.key == "mensajes") {
                    
            element.forEach(elementChild => {

                console.log("KEY: " + elementChild.key);
                usuario = elementChild.val().tokenUsuario
                console.log("VALOR: " + elementChild.val().mensaje);
                msg = elementChild.val().mensaje
            });
        }
    });
    
    resultado.forEach(element => {
        
        if (element.key == "dispositivos") {
                    
            element.forEach(elementChild => {
                       
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
                        console.log('Mensaje enviado correctamente:', response);
                    })
                    .catch((error) => {
                        console.log('Error enviando el mensaje:', error);
                    });
                    
                }       

            });
        }
        
        console.log("KEY: " + element.key);
    });
    
    
}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});


app.listen(8080, () => {
    console.log('Servidor web iniciado');
});