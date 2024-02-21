const io = require('socket.io-client');
const fs = require('fs');
const { generateProof } = require('./utils/clientfunctions');
const { createInterface, clearLine, moveCursor } = require("readline")

const interface = createInterface(process.stdin, process.stdout)

const config = require(process.argv.includes('--config') ? process.argv[process.argv.indexOf('--config')+1] : "./config.json")

// connect to the socket server
const socket = io(`${config.remote.socket.hostname}:${config.remote.socket.port}`);


// all the function to interact with the user
function init() {
    process.stdout.write("\x1Bc");
    console.log(Array(process.stdout.rows + 1).join("\n"));
}

function output(content) {
    clearLine(process.stdout);
    console.log(content);
    interface.prompt(true);
}

function input(question = "> ") {
    return new Promise(resolve => {
        interface.question(question, answer => {
            moveCursor(process.stdout, 0, -1);
            clearLine(process.stdout);
            resolve(answer);
        });
    })
}

async function *inputs() {
    while (true) {
        yield await input();
    }
}

// Event listener for when the socket connects
// listen for data from the server
socket.on('neonet', function(data) {
    output(data);
});
socket.on('neonet_data', function(data) {
    output(`${data.from}: ${data.data}`);
});


async function main() {
    init();
    for await (const input of inputs()) {
        const args = input.split(" ");
        if(args[0] === "login") {
            socket.emit('neonet', {
                mod: "auth",
                auth: btoa(JSON.stringify(generateProof(args[1], args[2])))
            });
        } else if(args[0] === "send") {
            socket.emit('neonet', {
                mod: "data",
                to: args[1],
                data: args.slice(2).join(" ")
            });
        } else if(args[0] === "exit") {
            process.exit();
        }
    }
}

main();


