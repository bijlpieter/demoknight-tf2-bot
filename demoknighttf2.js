const Discord = require('discord.js');

const client = new Discord.Client({disableEveryone: true});
let demoknighttf2 = 313;

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
		msg.channel.send(msg.author.displayName + " has praised the holy demoknight team fortress 2");
	}
	else if (msg.content.startsWith("!say")) {
		args = args.slice(1);
    	let sayMessage = args.join(" ");
    	msg.delete(); 
   		msg.channel.send(sayMessage);
	}

	return undefined;
});

client.login(process.env.TOKEN);