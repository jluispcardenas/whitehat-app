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
const wrapConsoleScreen = document.getElementById('wrap-console-screen');
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
            consoleScreen.scrollTop = consoleScreen.scrollHeight; // Scroll automático mientras escribe
            setTimeout(typeWriter, 30); // Ajusta el tiempo para cambiar la velocidad (50 ms por letra)
	} else {
	    setTimeout(function() { commandInput.focus() },100);
	}
    }

    typeWriter();
}


loginButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            loginScreen.style.display = 'none';
            wrapConsoleScreen.style.display = 'flex';
            writeToConsole('Access granted. Welcome to the system. Type "Start" or "Iniciar" for Spanish');
        }).catch((error) => {
            console.error('Auth error:', error);
        });

    commandInput.focus();
});


let threadId = null;  // Para almacenar el threadId después de crearlo

// Función para crear un nuevo hilo
async function createThread() {
    try {
        const response = await axios.get('/api/thread');
        threadId = response.data.threadId; // Guardamos el threadId para futuras interacciones
	//writeToConsole('Hilo creado. ID del hilo: ' + threadId);
    } catch (error) {
        console.error('Error creating thread:', error);
        writeToConsole('Error creating thread.');
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
        console.error('Could not get response from the assistant:', error);
        writeToConsole('Error: Could not get response from the assistant. Please try again later.');
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
		    writeToConsole("Loading Kali Linux environment to boot...")
                    await createThread();
                }

                await sendMessageToAssistant(command);  // Enviar el comando al asistente
		commandInput.focus()
            } catch (error) {
                console.error('Error sending message to assistant: ', error);
            	writeToConsole('Error sending message to assistant. Try again later.')
	    } finally {
                // Rehabilitar el campo de entrada después de recibir la respuesta
                commandInput.disabled = false;
            }
        }
    }
});


