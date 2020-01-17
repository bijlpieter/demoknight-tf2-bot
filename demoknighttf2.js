const discord = require('discord.js');
const tmi = require('tmi.js');
const req = require('request');
// const config = require('./settings.json')

const dclient = new discord.Client({disableEveryone: true});
dclient.login(process.env.TOKEN);
const solarclient = new tmi.client({
	connection: {
		reconnect: true,
		secure: true,
	},
	options: {
		debug: false,
	},
	identity: {
		username: "demoknight_tf2",
		password: process.env.SOLAR
	},
	channels: ['SolarLightTF2', 'chrysophylaxss', 'riskendeavors']
});
solarclient.connect();

const swipezclient = new tmi.client({
	connection: {
		reconnect: true,
		secure: true,
	},
	options: {
		debug: false,
	},
	identity: {
		username: "swipezslave",
		password: process.env.SWIPEZ
	},
	channels: ['mrswipez1']
});
swipezclient.connect();

let commands;

req(process.env.COMMANDS, { json: true }, (err, res, body) => {
	if (err) return console.log(err);
	commands = body;
});

dclient.on("ready", function() {
	dclient.user.setActivity('demoknight tf2', {type: 'PLAYING'});
	console.log("demoknight tf2");
});

solarclient.on('chat', (channel, userstate, message, self) => {
	if (message.startsWith("!") && !self) {
		let response = "";
		if (userstate.badges == null) response = handleCommand(solarclient, message.toLowerCase(), channel, userstate['display-name'], false);
		else response = handleCommand(solarclient, message.toLowerCase(), channel, userstate['display-name'], userstate.badges.hasOwnProperty('moderator') || userstate.badges.hasOwnProperty('broadcaster'));
		if (response) solarclient.say(channel, response);
	}
});

swipezclient.on('chat', (channel, userstate, message, self) => {
	if (message.startsWith("!") && !self) {
		let response = "";
		if (userstate.badges == null) response = handleCommand(swipezclient, message.toLowerCase(), channel, userstate['display-name'], false);
		else response = handleCommand(swipezclient, message.toLowerCase(), channel, userstate['display-name'], userstate.badges.hasOwnProperty('moderator') || userstate.badges.hasOwnProperty('broadcaster'));
		if (response) swipezclient.say(channel, response);
	}
});

swipezclient.on('raided', (channel, username, viewers) => {
	swipezclient.say(channel, "PogChamp " + username + " is raiding!!! PogChamp");
});

dclient.on('message', (message) => {
	if (message.content == "!clip") return message.channel.send("Can't clip discord!");
	if (message.content == "!uptime") return message.channel.send("This command is for twitch only! :(");
	if (message.content.startsWith("!") && !message.author.bot) {
		let response = handleCommand(dclient, message.content.toLowerCase(), "#solarlighttf2", message.member.displayName, message.member.hasPermission('MANAGE_MESSAGES', true, true, true));
		if (response) message.channel.send(response);
	}
	return undefined;
});

function handleCommand(client, msg, channel, name, mod) {
	if (msg.startsWith('!addcomm')) return newCommand(msg, channel, mod);
	else if (msg.startsWith('!delcomm')) return delCommand(msg, channel, mod);
	else if (msg == "!commands") return "-- Default Commands -- !clip, !commands, !demoknight, !info, !ping, !uptime -- Custom Commands -- " + commands[channel]["!commands"];
	else if (msg == "!clip") return createClip(channel, (param) => {client.say(channel, param)});
	else if (msg == "!ping") return "pong";
	else if (msg == "!info") return "demoknight_tf2 bot on GitHub: github.com/Chrysophylaxs/demoknight-tf2-bot";
	else if (msg == "!uptime") return getUptime(channel, (param) => {client.say(channel, param)});
	else if (msg.startsWith("!demoknight")) return name + " has praised the holy demoknight team fortress 2";
	else if (commands[channel].hasOwnProperty(msg)) return commands[channel][msg];
	else return "";
}

function newCommand(msg, channel, mod) {
	if (!mod) return "You don't have permission to use this command! D:";
	let args = msg.split(' ');
	if (args.length < 3) return "Invalid usage! Try: !addcomm [command_name] [response]";
	let newComm = "!" + args[1].replace("!", "");
	if (isInvalidComm(newComm)) return "This command cannot be overwritten! >:C";
	args = args.splice(2);
	if (!commands[channel].hasOwnProperty(newComm)) {
		let temp = commands[channel]["!commands"].split(', ');
		temp.push(newComm);
		temp.sort();
		commands[channel]["!commands"] = temp.join(", ");
	}
	commands[channel][newComm] = args.join(" ");
	updateCommands();
	return "Added or updated command!";
}

function delCommand(msg, channel, mod) {
	if (!mod) return "You don't have permission to use this command! D:";
	let args = msg.split(' ');
	if (args.length < 2) return "Invalid usage! Try: !delcomm [command_name]";
	let delComm = "!" + args[1].replace("!", "");
	if (isInvalidComm(delComm)) return "This command cannot be deleted! >:C";
	if (commands[channel].hasOwnProperty(delComm)) {
		delete commands[channel][delComm];
		commands[channel]["!commands"] = commands[channel]["!commands"].replace(", " + delComm, "");
		updateCommands();
		return "Deleted command!";
	}
	else return "Command does not exist!";
}

function updateCommands() {
	req({method: "PUT", uri: process.env.COMMANDS, json: commands});
}

const clipped = new Set();

function createClip(channel, callback) {
	if (!clipped.has(channel)) {
		clipped.add(channel);
		setTimeout(() => {clipped.delete(channel);}, 20000);
		let uri = "https://api.twitch.tv/kraken/users?login=" + channel.replace("#", "");
		solarclient.api({
			url: uri,
			method: "GET",
			headers: {
				"Accept": "application/vnd.twitchtv.v5+json",
				"Client-ID": process.env.CLIENTID
			}
		}, (err, res, body) => {
			if (err) {
				callback("An error occurred!");
				// solarclient.say(channel, "An error occurred!");
				return "";
			}
			let id = body.users[0]._id;
			solarclient.api({
				url: "https://api.twitch.tv/helix/clips?broadcaster_id=" + id,
				method: "POST",
				headers: {
					"Accept": "application/vnd.twitchtv.v5+json",
					"Client-ID": process.env.CLIENTID,
					"Authorization": process.env.BEARER
				}
			}, (err, res, body) => {
				if (body.hasOwnProperty('error')) {
					callback(body.message);
					// solarclient.say(channel, body.message);
				}
				else {
					let clipID = body.data[0].id
					console.log("https://clips.twitch.tv/" + clipID);
					callback("https://clips.twitch.tv/" + clipID);
					// solarclient.say(channel, "https://clips.twitch.tv/" + clipID);
				}
			});
		});
		return "";
	}
	else return "A clip was recently made by somebody else!";
}

function getUptime(channel, callback) {
	let url = "https://beta.decapi.me/twitch/uptime/" + channel.replace("#", "");
	req(url, (err, res, body) => {
		if (err) return console.log(err);
		if (body.startsWith(channel.replace("#", ""))) callback(body); // solarclient.say(channel, body);
		else callback(channel.replace("#", "") + " has been live for " + body); // solarclient.say(channel, channel.replace("#", "") + " has been live for " + body);
	});
	return "";
}

function isInvalidComm(comm) {
	return comm == "!commands" || comm.startsWith("!demoknight") || comm == "!clip" || comm == "!uptime" || comm == "!info" || comm == "!rtd";
}