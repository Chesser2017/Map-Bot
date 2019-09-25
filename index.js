const Discord = require('discord.js');
const fs = require('fs');

const {prefix, token} = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    client.user.setActivity('evades.io | .help', {type: "PLAYING"});;
    console.log('ready');
})

client.on('message', msg => {
    if(msg.author.bot || !msg.content.startsWith(prefix) || !msg.guild) return;

    const arguments = msg.content.slice(prefix.length).split(/ +/);
    const commandName = arguments[0];
    
    const command = client.commands.get(commandName) 
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if(!command) return;
    if(command.modOnly && !msg.member.hasPermission('MANAGE_ROLES')){
        return msg.reply(` you do not have the permissions for that message!`)
    }

    try{
        command.execute(msg, arguments, client);
    }
    catch{
        console.error;
    }
})

client.login(token);