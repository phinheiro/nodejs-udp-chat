const socket = require("dgram").createSocket("udp4");
const PORT = 1111;
const HOSTNAME = "localhost";

var clients = [];

socket.bind(PORT, HOSTNAME);

socket.on("listening", () => {
  const address = socket.address();
  console.log(`Servidor iniciado em ${address.address}:${address.port}`);
  console.log("Pressione Ctrl + C para finalizar...");
});

socket.on("message", (data, rinfo) => {
  let messageObject = JSON.parse(data.toString());

  if (messageObject.header.type === "sending") {
    let tasks = [];
    for (let client of clients) {
      if (client.address === rinfo.address && client.port === rinfo.port) {
        continue;
      }
      tasks.push(
        new Promise((resolve, reject) => {
          try {
            resolve(
              socket.send(data, 0, data.length, client.port, client.address)
            );
          } catch (error) {
            reject(0);
          }
        })
      );
    }
    Promise.all(tasks).then(result =>
      console.log("Mensagem entregue conforme esperado...")
    );
  } else if (messageObject.header.type === "connecting") {
    console.log(`Novo cliente conectado no endereço ${rinfo.address}:${rinfo.port}`);
    clients.push({
      address: rinfo.address,
      port: rinfo.port
    });
  }
});

socket.on("error", err => {
  console.log(`Ocorreu um erro no servidor: ${err.stack}`);
  socket.close();
});