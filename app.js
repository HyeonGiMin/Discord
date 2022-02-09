const jsonFile = fs.readFileSync('./config.json', 'utf8');
const config = JSON.parse(jsonFile);

const Discord = require("discord.js");

const client = new Discord.Client();

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
