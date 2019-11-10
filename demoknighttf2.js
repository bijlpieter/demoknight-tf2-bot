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
const tclient = new tmi.client(options);
tclient.connect();

dclient.on("ready", function() {
	dclient.user.setActivity('demoknight tf2', {type: 'PLAYING'});
	console.log("demoknight tf2");
});

let commands = {
	"!commands": "error"
};

req(process.env.COMMANDS, { json: true }, (err, res, body) => {
	if (err) return console.log(err);
	commands = body;
});

tclient.on('chat', (channel, userstate, message, self) => {
	if (self) return;
	if (message.startsWith('!addcomm') && (userstate.badges.hasOwnProperty('moderator') || userstate.badges.hasOwnProperty('broadcaster'))) {
		if (newCommand(message)) tclient.say(channel, "Added or updated command!");
		else tclient.say(channel, "Could not add command!");
	}
	else if (message.startsWith('!delcomm') && userstate['mod'] == true) {
		if (delCommand(message)) tclient.say(channel, "Removed command!");
		else tclient.say(channel, "Could not remove command!");
	}
	else if (message.startsWith('!')) {
		let msg = message.toLowerCase();
		if (commands.hasOwnProperty(msg)) {
			response = commands[msg];
			if (msg.startsWith("!demoknight")) response = userstate['display-name'] + response;
			tclient.say(channel, response);
		}
	}
});

dclient.on('message', (message) => {
	if (message.content.startsWith('!addcomm') && message.member.hasPermission('MANAGE_MESSAGES', true, true, true)) {
		if (newCommand(message.content)) message.channel.send("Added or updated command!");
		else message.channel.send("Could not add command!");
	}
	else if (message.content.startsWith('!delcomm') && message.member.hasPermission('MANAGE_MESSAGES', true, true, true)) {
		if (delCommand(message.content)) message.channel.send("Removed command!");
		else message.channel.send("Could not remove command!");
	}
	else if (message.content.startsWith('!')) {
		let msg = message.content.toLowerCase();
		if (commands.hasOwnProperty(msg)) {
			response = commands[msg];
			if (msg.startsWith("!demoknight")) response = message.member.displayName + response;
			message.channel.send(response);
		}
	}
	return undefined;
});

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
		uri: process.env.COMMANDS,
		json: commands
	});
}

dclient.login(process.env.TOKEN);