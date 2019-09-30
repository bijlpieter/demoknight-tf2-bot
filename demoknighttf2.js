const Discord = require('discord.js');

const client = new Discord.Client({disableEveryone: true});

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