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
	channels: ['SolarLightTF2', 'mrswipez1', 'chrysophylaxss', 'riskendeavors']
};

const dclient = new discord.Client({disableEveryone: true});
dclient.login(process.env.TOKEN);
const tclient = new tmi.client(options);
tclient.connect();

let commands = {
	"solarlighttf2": {
		"!commands": "!commands, !demoknight"
	},
	"mrswipez1": {
		"!commands": "!commands, !demoknight"
	},
	"chrysophylaxss": {
		"!commands": "!commands, !demoknight"
	}
	"riskendeavors": {
		"!commands": "!commands, !demoknight"
	}
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
		let response = "";
		if (userstate.badges == null) response = handleCommand(message.toLowerCase(), channel, userstate['display-name'], false);
		else response = handleCommand(message.toLowerCase(), channel, userstate['display-name'], userstate.badges.hasOwnProperty('moderator') || userstate.badges.hasOwnProperty('broadcaster'));
		if (response) tclient.say(channel, response);
	}
});

dclient.on('message', (message) => {
	if (message.content == "!clip") return message.channel.send("Can't clip discord!");
	if (message.content.startsWith("!") && !message.author.bot) {
		let response = handleCommand(message.content.toLowerCase(), "#solarlighttf2", message.member.displayName, message.member.hasPermission('MANAGE_MESSAGES', true, true, true));
		if (response) message.channel.send(response);
	}
	return undefined;
});

function handleCommand(msg, channel, name, mod) {
	if (msg.startsWith('!addcomm') && mod) return newCommand(msg, channel);
	else if (msg.startsWith('!delcomm') && mod) return delCommand(msg, channel);
	else if (msg == "!clip") return createClip(channel);
	else if (msg.startsWith("!demoknight")) return name + " has praised the holy demoknight team fortress 2";
	else if (commands[channel].hasOwnProperty(msg)) return commands[channel][msg];
	else return "";
}

function newCommand(msg, channel) {
	let args = msg.split(' ');
	if (args.length < 3) return "Invalid usage! Try: !addcomm command_name response";
	let newComm = args[1].replace("!", "");
	if (newComm == "commands" || newComm == "demoknight" || newComm == "clip") return "Do not try to overwrite the !commands command >:C";
	args = args.splice(2);
	if (!commands[channel].hasOwnProperty("!" + newComm)) commands[channel]["!commands"] += ", !" + newComm;
	commands[channel]["!" + newComm] = args.join(" ");
	updateCommands();
	return "Added or updated command!";
}

function delCommand(msg, channel) {
	let args = msg.split(' ');
	let delComm = args[1].replace("!", "");
	if (delComm == "commands" || delComm == "demoknight" || delComm == "clip") return "This command cannot be deleted >:C";
	if (commands[channel].hasOwnProperty("!" + delComm)) {
		delete commands[channel]["!" + delComm];
		commands[channel]["!commands"] = commands[channel]["!commands"].replace(", !" + delComm, "");
		updateCommands();
		return "Deleted command!";
	}
	else return "Command does not exist!";
}

function updateCommands() {
	req({method: "PUT", uri: process.env.COMMANDS, json: commands});
}

const clipped = new Set();

function createClip(channel) {
	if (!clipped.has(channel)) {
		clipped.add(channel);
		setTimeout(() => {clipped.delete(channel);}, 20000);
		let uri = "https://api.twitch.tv/kraken/users?login=" + channel.replace("#", "");
		tclient.api({
			url: uri,
			method: "GET",
			headers: {
				"Accept": "application/vnd.twitchtv.v5+json",
				"Client-ID": process.env.CLIENTID
			}
		}, (err, res, body) => {
			if (err) {
				tclient.say(channel, "An error occurred!");
				return "";
			}
			let id = body.users[0]._id;
			tclient.api({
				url: "https://api.twitch.tv/helix/clips?broadcaster_id=" + id,
				method: "POST",
				headers: {
					"Accept": "application/vnd.twitchtv.v5+json",
					"Client-ID": process.env.CLIENTID,
					"Authorization": process.env.BEARER
				}
			}, (err, res, body) => {
				if (body.hasOwnProperty('error')) {
					tclient.say(channel, body.message);
				}
				else {
					let clipID = body.data[0].id
					console.log("https://clips.twitch.tv/" + clipID);
					tclient.say(channel, "https://clips.twitch.tv/" + clipID);
				}
			});
		});
		return "";
	}
	else return "A clip was recently made by somebody else!";
}