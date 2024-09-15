const firebaseConfig = {
    apiKey: "AIzaSyA1LPUbyaBgirVe0zXG9wJeRu5TmqKrAfk",
    authDomain: "whitehat-app-89f74.firebaseapp.com",
    projectId: "whitehat-app-89f74",
    storageBucket: "whitehat-app-89f74.appspot.com",
    messagingSenderId: "709929399153",
    appId: "1:709929399153:web:9e86319435aae0ba79bcd0",
    measurementId: "G-MGNDK3QFG9"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

const loginScreen = document.getElementById('login-screen');
const consoleScreen = document.getElementById('console-screen');
const loginButton = document.getElementById('login-button');
const output = document.getElementById('output');
const commandInput = document.getElementById('command-input');

// Función para escribir en la consola
function writeToConsole(text) {
    const p = document.createElement('p');
    output.appendChild(p);
    let index = 0;

    function typeWriter() {
        if (index < text.length) {
            p.textContent += text.charAt(index);
            index++;
            output.scrollTop = output.scrollHeight; // Scroll automático mientras escribe
            setTimeout(typeWriter, 50); // Ajusta el tiempo para cambiar la velocidad (50 ms por letra)
        }
    }

    typeWriter();
}


loginButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            loginScreen.style.display = 'none';
            consoleScreen.style.display = 'flex';
            writeToConsole('Acceso concedido. Bienvenido al sistema. Escribe "Iniciar"');
        }).catch((error) => {
            console.error('Error de autenticación:', error);
        });
});


let threadId = null;  // Para almacenar el threadId después de crearlo

// Función para crear un nuevo hilo
async function createThread() {
    try {
        const response = await axios.get('/api/thread');
        threadId = response.data.threadId; // Guardamos el threadId para futuras interacciones
	//writeToConsole('Hilo creado. ID del hilo: ' + threadId);
    } catch (error) {
        console.error('Error al crear el hilo:', error);
        writeToConsole('Error al crear el hilo.');
    }
}

// Función para enviar un mensaje y obtener la respuesta del asistente
async function sendMessageToAssistant(message) {
    try {
        const response = await axios.post('/api/message', {
            message: message,
            threadId: threadId
        });
        
        // Mostrar las respuestas del asistente
        const messages = response.data.messages;
        /*messages.forEach(msg => {
            writeToConsole(`IA: ${msg}`);
        });*/
	writeToConsole(messages[0][0].text.value)
	console.log(messages[0])
	
    } catch (error) {
        console.error('Error al obtener respuesta del asistente:', error);
        writeToConsole('Error: No se pudo obtener una respuesta del asistente.');
    }
}

commandInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        const command = commandInput.value.trim();
        writeToConsole(`$ ${command}`);
        commandInput.value = '';

        // Deshabilitar el campo de entrada mientras se procesa la respuesta
        commandInput.disabled = true;

        if (command.toLowerCase() === 'exit') {
            writeToConsole('Cerrando sesión...');
            setTimeout(() => {
                loginScreen.style.display = 'flex';
                consoleScreen.style.display = 'none';
                output.innerHTML = '';
                commandInput.disabled = false; // Habilitar el campo de entrada de nuevo
            }, 1500);
        } else {
            try {
                // Si no hay un threadId, crear uno primero
                if (!threadId) {
		    writeToConsole("Cargando ambiente Kali Linux para iniciar...")
                    await createThread();
                }

                await sendMessageToAssistant(command);  // Enviar el comando al asistente
            } catch (error) {
                console.error('Error al enviar el mensaje al asistente:', error);
            	writeToConsole('Error al enviar el mensaje al asistente')
	    } finally {
                // Rehabilitar el campo de entrada después de recibir la respuesta
                commandInput.disabled = false;
            }
        }
    }
});


