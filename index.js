const Discord = require('discord.js');
const fs = require('fs');
const Users = require('./db.js');
let {fetchBank} = require('./functions.js');
const {prefix, token} = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const xpGain = [];

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', async() => {
    client.user.setActivity('evades.io | .help', {type: "PLAYING"});;
    console.log('ready');
})

client.on('message', async msg => {
    if(msg.author.bot) return;
    if(!xpGain.some(id => id === msg.author.id)){
        let userBank = await fetchBank(msg.author);
        xpGain.push(msg.author.id);

        let increase = userBank.dataValues.current_xp + Math.floor(Math.random() * 11) + 10;
        let newlevel =  userBank.dataValues.level;
        let newCurrency = userBank.dataValues.currency;
        if(increase >= 100 + ((newlevel - 1) * 75)){
            increase = 0;
            newlevel++;
            newCurrency +=  Math.floor((Math.random() * 100) + 50);
            msg.channel.send(`${msg.author} is now LEVEL ${newlevel}!`);
        }
        await Users.update({
            current_xp: increase,
            level: newlevel,
            currency: newCurrency
        }, {where:{ user_id: msg.author.id}});
        setTimeout(() => {
            xpGain.splice(xpGain.indexOf(msg.author.id), 1);
        }, ((Math.random() * 11) + 15) * 1000);
    }

    if(!msg.content.startsWith(prefix) || !msg.guild) return;

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