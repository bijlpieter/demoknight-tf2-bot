const discord = require('discord.js');
const tmi = require('tmi.js');
const req = require('request');

const options = {
	connection: {
		reconnect: true,
		secure: true,
	},
	options: {
		debug: false,
	},
	identity: {
		username: "demoknight_tf2",
		password: process.env.TWITCH
	},
	channels: ['SolarLightTF2', 'chrysophylaxss']
};

const dclient = new discord.Client({disableEveryone: true});
dclient.login(process.env.TOKEN);
const tclient = new tmi.client(options);
tclient.connect();

let commands = {
	"!commands": "error"
};

req(process.env.COMMANDS, { json: true }, (err, res, body) => {
	if (err) return console.log(err);
	commands = body;
});

dclient.on("ready", function() {
	dclient.user.setActivity('demoknight tf2', {type: 'PLAYING'});
	console.log("demoknight tf2");
});

tclient.on('chat', (channel, userstate, message, self) => {
	if (message.startsWith("!") && !self) {
		let response = handleCommand(message.toLowerCase(), userstate['display-name'], userstate.badges.hasOwnProperty('moderator') || userstate.badges.hasOwnProperty('broadcaster'));
		if (response) tclient.say(channel, response);
	}
});

dclient.on('message', (message) => {
	if (message.content.startsWith("!") && !message.author.bot) {
		let response = handleCommand(message.content.toLowerCase(), message.member.displayName, message.member.hasPermission('MANAGE_MESSAGES', true, true, true));
		if (response) message.channel.send(response);
	}
	return undefined;
});

function handleCommand(msg, name, mod) {
	if (msg.startsWith('!addcomm') && mod) return newCommand(msg);
	else if (msg.startsWith('!delcomm') && mod) return delCommand(msg);
	else if (msg.startsWith("!demoknight")) return name + commands["!demoknight"];
	else if (commands.hasOwnProperty(msg)) return commands[msg];
	else return "";
}

function newCommand(msg) {
	let args = msg.split(' ');
	if (args.length < 3) return "Invalid usage! Try: !addcomm command_name response";
	let newComm = args[1].replace("!", "");
	if (newComm == "commands") return "Do not try to overwrite the !commands command >:C";
	args = args.splice(2);
	if (!commands.hasOwnProperty("!" + newComm)) commands["!commands"] += ", !" + newComm;
	commands["!" + newComm] = args.join(" ");
	updateCommands();
	return "Added or updated command!";
}

function delCommand(msg) {
	let args = msg.split(' ');
	let delComm = args[1].replace("!", "");
	if (delComm == "commands" || delComm == "demoknight") return "This command cannot be deleted >:C";
	if (commands.hasOwnProperty("!" + delComm)) {
		delete commands["!" + delComm];
		commands["!commands"] = commands["!commands"].replace(", !" + delComm, "");
		updateCommands();
		return "Deleted command!";
	}
	else return "Command does not exist!";
}

function updateCommands() {
	req({
		method: "PUT",
		uri: process.env.COMMANDS,
		json: commands
	});
}