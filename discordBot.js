const fs = require('fs');
const logger = require('./winston')
const jsonFile = fs.readFileSync('./config.json', 'utf8');
const config = JSON.parse(jsonFile);
const prefix = "!";

const { Client, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on("message", function(message) {
    // message 작성자가 봇이면 그냥 return
    if (message.author.bot) return;
    // message 시작이 prefix가 아니면 return
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    if (command === "ping") {
        message.reply(`pong!`);
    }
});


client.login(config.Token);
