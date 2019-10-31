const Discord = require('discord.js');
const tmi = require('tmi.js');

const client = new Discord.Client({disableEveryone: true});

const options = {
	connection: {
		reconnect: true,
		secure: true,
	},
	options: {
		debug: true,
	},
	identity: {
		username: "demoknight_tf2",
		password: "oauth:q7det5pjtc8q6vqfcbtc6vclqlmz8o"
	},
	channels: ['SolarLightTF2']
};

const tclient = new tmi.client(options);
tclient.connect();
tclient.on('chat', function(channel, userstate, message, self) {
	if (message == "!demoknighttf2") {
		tclient.say(channel, userstate['display-name'] + " has praised the holy demoknight team fortress 2");
	}
});

client.on("ready", function() {
	client.user.setActivity('demoknight tf2', {type: 'PLAYING'});
	console.log("demoknight tf2");
});

client.on('message', async msg => {
	if (msg.content.startsWith('!demoknighttf2')) {
		msg.channel.send(msg.member.displayName + " has praised the holy demoknight team fortress 2");
	}
	return undefined;
});

client.login(process.env.TOKEN);