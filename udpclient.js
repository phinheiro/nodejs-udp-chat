const socket = require("dgram").createSocket("udp4");
const Readline = require("readline")
const SERVER_HOSTNAME = "localhost";
const SERVER_PORT = 1111;
const USER_HOSTNAME = "localhost";

var USER_PORT;
var userAddress = "";


console.log("---CHAT---")
console.log("Pressione Ctrl + C para finalizar...");


const readline = Readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

socket.bind(USER_PORT, USER_HOSTNAME);

socket.on("listening", () => {
	userAddress = socket.address();
	
	let data = {
		header: {
			type: "connecting"
		}
	};

	let message = Buffer.from(JSON.stringify(data));
	socket.send(
		message,
		0,
		message.length,
		SERVER_PORT,
		SERVER_HOSTNAME
	);
});

socket.on("message", (data, rinfo) => {
	let messageObject = JSON.parse(data.toString());

	if (messageObject.header.type === "sending") {
		console.log(Buffer.from(messageObject.body.message).toString());
	} else {
		console.log("unknownsage");
	}
});

readline.on("line", input => {
	let { address, port } = userAddress;
	let data = {
		header: {
			type: "sending"
		},
		body: {
			message: Buffer.from(
				`${address}:${port} --> ${input}`
			).toJSON()
		}
	};

	let message = Buffer.from(JSON.stringify(data));
	socket.send(
		message,
		0,
		message.length,
		SERVER_PORT,
		SERVER_HOSTNAME
	);

	console.log(`você: ${input}`);
});

socket.on("message", (data, rinfo) => {
	let messageObject = JSON.parse(data.toString());

	if (messageObject.header.type === "close") {
		console.log(Buffer.from(messageObject.body.message).toString());
		process.exit();
	}
});

socket.on("error", err => {
	console.log(`Ocorreu um erro no servidor: ${err.stack}`);
});