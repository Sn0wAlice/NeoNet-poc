const io = require("socket.io-client");
const fs = require("fs");
const { generateProof } = require("./utils/clientfunctions");
const { createInterface, clearLine, moveCursor } = require("readline");
const registreRsa = require("./rsa/main");

const interface = createInterface(process.stdin, process.stdout);

const config = require(process.argv.includes("--config")
  ? process.argv[process.argv.indexOf("--config") + 1]
  : "./config.json");

// connect to the socket server
const socket = io(
  `${config.remote.socket.hostname}:${config.remote.socket.port}`
);

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
  return new Promise((resolve) => {
    interface.question(question, (answer) => {
      moveCursor(process.stdout, 0, -1);
      clearLine(process.stdout);
      resolve(answer);
    });
  });
}

async function* inputs() {
  while (true) {
    yield await input();
  }
}

// Event listener for when the socket connects
// listen for data from the server
socket.on("neonet", function (data) {
  output(data);
});
socket.on("neonet_data", function (data) {
  output(`${data.from}: ${data.data}`);
});

// Event listener for when the rsa is given
socket.on("neonet_rsa", function (data) {
  if (!data.from || !data.rsa) return;

  registreRsa.addRsa(data.from, data.rsa);
  // if i asked for the rsa key, remove it from the list
  if (registreRsa.isAskedRsa(data.from)) {
    registreRsa.removeAskedRsa(data.from);
  } else {
    // if not i should send my rsa key
    socket.emit("neonet", {
      mod: "rsa",
      rsa: registreRsa.getPulicKey(),
      to: data.from,
    });
  }
  output(`RSA key from ${data.from} added; you can now send data to this user`);
});

socket.on("neonet_encrypted", function (data) {
  if (!data.from || !data.data) return;
  var [isOk, translated] = registreRsa.unCypher(data.data);
  if (isOk) {
    output(`[SECRET] ${data.from}: ${translated}`);
  } else {
    output(`Couldn't translate message from ${data.from}`);
  }
});

async function main() {
  init();
  for await (const input of inputs()) {
    const args = input.split(" ");
    if (args[0] === "login") {
      socket.emit("neonet", {
        mod: "auth",
        auth: btoa(JSON.stringify(generateProof(args[1], args[2]))),
      });
    } else if (args[0] === "send") {
      socket.emit("neonet", {
        mod: "data",
        to: args[1],
        data: args.slice(2).join(" "),
      });
    } else if (args[0] === "send_secure") {
      if (!registreRsa.hasKey(args[1])) {
        output(
          `Can't send message to ${args[1]} please try to connect with it first (ex: connect ${args[1]})`
        );
        continue;
      }
      socket.emit("neonet", {
        mod: "data",
        to: args[1],
        data: registreRsa.cypher(args[1], args.slice(2).join(" ")),
        type: "encrypted"
      });
    } else if (args[0] === "connect") {
      if (registreRsa.getListUser().includes(args[1])) {
        output("You are already connected to this user");
        continue;
      }
      registreRsa.addAskedRsa(args[1]);
      socket.emit("neonet", {
        mod: "rsa",
        rsa: registreRsa.getPulicKey(),
        to: args[1],
      });
    } else if (args[0] === "list_user") {
      output(registreRsa.getListUser());
    } else if (args[0] === "exit") {
      process.exit();
    }
  }
}

main();
