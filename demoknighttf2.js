const discord = require('discord.js');
const tmi = require('tmi.js');
const req = require('request');
const config = require('./config.json');

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
		password: config.twitch
	},
	channels: ['SolarLightTF2', 'chrysophylaxss']
};

const dclient = new discord.Client({disableEveryone: true});
dclient.login(config.token);
const tclient = new tmi.client(options);
tclient.connect();

let commands = {
	"!commands": "error"
};

req(config.commands, { json: true }, (err, res, body) => {
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
		if (response != "") tclient.say(channel, response);
	}
});

dclient.on('message', (message) => {
	if (message.content.startsWith("!") && !message.author.bot) {
		let response = handleCommand(message.content.toLowerCase(), message.member.displayName, message.member.hasPermission('MANAGE_MESSAGES', true, true, true));
		if (response != "") message.channel.send(response);
	}
	return undefined;
});

function handleCommand(msg, name, mod) {
	if (msg.startsWith('!addcomm') && mod) {
		if (newCommand(msg)) return "Added or updated command!";
		else return "Could not add command!";
	}
	else if (msg.startsWith('!delcomm') && mod) {
		if (delCommand(msg)) return "Removed command!"
		else return "Could not remove command!";
	}
	else if (commands.hasOwnProperty(msg)) {
		if (msg.startsWith("!demoknight")) return name + commands[msg];
		else return commands[msg];
	}
	else return "";
}

function newCommand(msg) {
	let args = msg.split(' ');
	if (args.length < 3) return false;
	let newComm = args[1];
	args = args.splice(2);
	commands["!" + newComm] = args.join(" ");
	if (commands.hasOwnProperty("!" + newComm)) commands["!commands"] += ", !" + newComm;
	updateCommands();
	return true;
}

function delCommand(msg) {
	let args = msg.split(' ');
	let delComm = args[1];
	if (delComm == "commands") return false;
	if (commands.hasOwnProperty("!" + delComm)) {
		delete commands["!" + delComm];
		commands["!commands"] = commands["!commands"].replace(", !" + delComm, "");
		updateCommands();
		return true;
	}
	else return false;
}

function updateCommands() {
	req({
		method: "PUT",
		uri: config.commands,
		json: commands
	});
}