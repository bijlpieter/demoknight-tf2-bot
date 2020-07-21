const discord = require("discord.js");
const tmi = require("tmi.js");
const req = require("./httprequest.js");

const dClient = new discord.Client({disableEveryone: true});
dClient.login(process.env.TOKEN);

const tClient = new tmi.client({
	connection: {reconnect: true, secure: true},
	options: {debug: false},
	identity: {username: "demoknight_tf2", password: process.env.SOLAR},
	channels: ["SolarLightTF2", "chrysophylaxss", "riskendeavors"]
});
tClient.connect();

let commands;
const cDefault = "!clip, !commands, !demoknight, !info, !ping, !uptime";

function getCommands() {
	req.get("https://api.jsonbin.io/b/" + process.env.COMMANDS + "/latest",
		{"secret-key": process.env.JSONAPI})
		.then((data) => {commands = JSON.parse(data)})
		.catch((error) => {console.log("Could not get commands on startup: " + error)}
	);
}

getCommands();

dClient.on("ready", function() {
	dClient.user.setActivity("demoknight tf2", {type: "PLAYING"});
	console.log("demoknight tf2");
});

function isTwitchMod(userstate) {
	if (userstate.badges == null) return false;
	return userstate.badges.hasOwnProperty("moderator") || userstate.badges.hasOwnProperty("broadcaster");
}

tClient.on("chat", (channel, userstate, message, self) => {
	if (message.startsWith("!") && !self) {
		let args = message.split(" ");
		let command = args[0].toLowerCase();
		handleCommand({
			"message": message,
			"command": command,
			"args": args,
			"author": userstate["display-name"],
			"channel": channel,
			"mod": isTwitchMod(userstate)
		})
		.then((response) => {if (response) tClient.say(channel, response)})
		.catch((error) => {console.log(error); if (error) tClient.say(channel, error)});
	}
});

dClient.on("message", (message) => {
	if (message.content.startsWith("!") && !message.author.bot) {
		let args = message.content.split(" ");
		let command = args[0].toLowerCase();
		handleCommand({
			"command": command,
			"args": args,
			"author": message.member.displayName,
			"channel": "#solarlighttf2",
			"mod": message.member.hasPermission("MANAGE_MESSAGES", true, true, true)
		})
		.then((response) => {if (response) message.channel.send(response)})
		.catch((error) => {console.log(error); if (error) message.channel.send(error)});
	}
	return undefined;
});

function handleCommand(options) {
	switch (options.command) {
		case "!addcomm":
		case "!addcommand":
			return newCommand(options);
			break;
		case "!editcomm":
		case "!editcommand":
			return editCommand(options);
			break;
		case "!delcomm":
		case "!delcommand":
			return delCommand(options);
			break;
		case "!commands":
			return new Promise((resolve, reject) => {
				retrieveCommand("!commands", options.channel).then((response) => resolve(cDefault + response)).catch((error) => reject(error));
			});
			break;
		case "!clip":
			return createClip(options.channel);
			break;
		case "!ping":
			return new Promise((resolve) => resolve("!pong"));
			break;
		case "!info":
			return new Promise((resolve) => resolve("demoknight_tf2 bot on GitHub: github.com/Chrysophylaxs/demoknight-tf2-bot"));
			break;
		case "!uptime":
			return getUptime(options.channel);
			break;
		case "!demoknight":
		case "!demoknighttf2":
			return new Promise((resolve) => resolve(options.author + " has praised the holy demoknight team fortress 2"));
			break;
		case "!soldier":
		case "!soldiertf2":
			return new Promise((resolve) => resolve(options.author + " has praised soldier tf2"));
			break;
		default:
			return retrieveCommand(options.command, options.channel);
			break;
	}
}

function retrieveCommand(comm, channel) {
	return new Promise((resolve, reject) => {
		if (commands[channel].hasOwnProperty(comm)) resolve(commands[channel][comm]);
		else reject("");
	});
}

function newCommand(options) {
	return new Promise((resolve, reject) => {
		if (!options.mod) return reject("You don't have permission to use this command! D:");
		if (options.args.length < 3) return reject("Invalid usage! Try: !addcomm [command_name] [response]");
		let newComm = "!" + options.args[1].replace("!", ""); // add leading '!' if omitted in command
		newComm = newComm.toLowerCase();
		if (isInvalidComm(newComm)) return reject("This command cannot be added! >:C");
		if (commands[options.channel].hasOwnProperty(newComm)) return reject("Command already exists, use !editcomm [command_name] [new_reponse] to edit the command");
		let args = options.args.splice(2);
		commands[options.channel][newComm] = args.join(" ");
		let temp = commands[options.channel]["!commands"].split(", ");
		temp.push(newComm);
		temp.sort();
		commands[options.channel]["!commands"] = temp.join(", ");
		updateCommands();
		return resolve("Added command successfully!");
	});
}

function editCommand(options) {
	return new Promise((resolve, reject) => {
		if (!options.mod) return reject("You don't have permission to use this command! D:");
		if (options.args.length < 3) return reject("Invalid usage! Try: !editcomm [command_name] [response]");
		let newComm = "!" + options.args[1].replace("!", ""); // add leading '!' if omitted in command
		newComm = newComm.toLowerCase();
		if (isInvalidComm(newComm)) return reject("This command cannot be overwritten! >:C");
		if (!commands[options.channel].hasOwnProperty(newComm)) return reject("Command does not exist, use !addcomm [command_name] [new_reponse] to add the command");
		let args = options.args.splice(2);
		commands[options.channel][newComm] = args.join(" ");
		updateCommands();
		return resolve("Updated command successfully!");
	});
}

function delCommand(options) {
	return new Promise((resolve, reject) => {
		if (!options.mod) return reject("You don't have permission to use this command! D:");
		if (options.args.length < 2) return reject("Invalid usage! Try: !delcomm [command_name]");
		let newComm = "!" + options.args[1].replace("!", ""); // add leading '!' if omitted in command
		newComm = newComm.toLowerCase();
		if (isInvalidComm(newComm)) return reject("This command cannot be deleted! >:C");
		if (!commands[options.channel].hasOwnProperty(newComm)) return reject("Command does not exist, use !addcomm [command_name] [new_reponse] to add the command");
		delete commands[options.channel][newComm];
		commands[options.channel]["!commands"] = commands[options.channel]["!commands"].replace(", " + newComm, "");
		updateCommands();
		return resolve("Deleted command successfully!");
	});
}

function updateCommands() {
	req.put("https://api.jsonbin.io/b/" + process.env.COMMANDS, JSON.stringify(commands), {
		'Content-Type': 'application/json',
		"secret-key": process.env.JSONAPI
	}).then((data) => console.log(data)).catch((error) => console.error(error));
}

const clipped = new Set();

function createClip(channel) {
	return new Promise((resolve, reject) => {
		if (clipped.has(channel)) return reject("A clip was recently made by somebody else!");
		clipped.add(channel);
		setTimeout(() => {clipped.delete(channel)}, 20000);
		req.get("https://api.twitch.tv/kraken/users?login=" + channel.replace("#", ""), {
			"Accept": "application/vnd.twitchtv.v5+json",
			"Client-ID": process.env.CLIENTID
		}).then((response) => {
			let res = JSON.parse(response);
			let id = res.users[0]._id;
			return req.post("https://api.twitch.tv/helix/clips?broadcaster_id=" + id, "", {
				"Accept": "application/vnd.twitchtv.v5+json",
				"Client-ID": process.env.CLIENTID,
				"Authorization": process.env.BEARER
			});
		}).then((response) => {
			let res = JSON.parse(response);
			if (res.hasOwnProperty("error")) return reject(res.message);
			let clipID = res.data[0].id;
			console.log("https://clips.twitch.tv/" + clipID);
			return resolve("https://clips.twitch.tv/" + clipID);
		}).catch((error) => {
			return reject(error);
		});
	});
}

function getUptime(channel) {
	return req.get("https://beta.decapi.me/twitch/uptime/" + channel.replace("#", ""));
}

function isInvalidComm(comm) {
	return comm == "!commands" || comm == "!demoknight" || comm == "!demoknighttf2" || comm == "!soldiertf2" || comm == "!soldiertf2" || comm == "!clip" || comm == "!uptime" || comm == "!info" 
		|| comm == "!ping" || comm == "!addcomm" || comm == "!editcommand" || comm == "!editcomm" || comm == "!addcommand" || comm == "!delcomm" || comm == "!delcommand";
}