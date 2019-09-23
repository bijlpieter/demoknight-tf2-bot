const Discord = require('discord.js');

const client = new Discord.Client({disableEveryone: true});
let demoknighttf2 = 311;

client.on("ready", function() {
	client.user.setActivity('demoknight tf2', {type: 'PLAYING'});
	console.log("demoknight tf2");
});

client.on('message', async msg => {
	let args = msg.content.split(' ');
	for (let i = 0; i < args.length - 1; i++) {
		if (args[i] == "demoknight" && args[i + 1] == "tf2") {
			demoknighttf2++;
		}
	}
	if (msg.content.startsWith('!demoknighttf2')) {
		msg.channel.send("demoknight team fortress 2 counter: " + demoknighttf2);
	}
	return undefined;
});

client.login(process.env.TOKEN);