const socket = io();
const output = document.getElementById('output');
const input = document.getElementById('input');

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const command = input.value;
        appendToOutput(`$ ${command}`);
        socket.emit('command', command);
        input.value = '';
    }
});

socket.on('response', (response) => {
    appendToOutput(response);
});

function appendToOutput(text) {
    const p = document.createElement('p');
    p.textContent = text;
    output.appendChild(p);
    output.scrollTop = output.scrollHeight;
}

// commands/commandHandler.js
const commands = {
    help: () => 'Comandos disponibles: help, echo, clear',
    echo: (args) => args.join(' '),
    clear: () => {
        document.getElementById('output').innerHTML = '';
        return '';
    },
    // Agrega más comandos aquí
};

function handleCommand(input) {
    const [command, ...args] = input.trim().split(' ');
    
    if (commands[command]) {
        return commands[command](args);
    } else {
        return `Comando no reconocido: ${command}. Escribe 'help' para ver los comandos disponibles.`;
    }
}

module.exports = { handleCommand };
