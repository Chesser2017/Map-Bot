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

client.once('ready', () => {
    client.user.setActivity(`${prefix}help`, {type: "PLAYING"});
    console.log('ready');
})

client.on('message', async msg => {
    if(msg.author.bot || !msg.guild ) return;
    if(msg.mentions.users.first() == client.user)
        return msg.reply(` the prefix is \`${prefix}\`!\n${prefix}help to see all the commands.`);
    
    //Leveling Logic START
    if(!xpGain.some(id => id === msg.author.id)){
        //If the user is in the array, that means they gained xp already
        //and need to wait
        //Since adding xp to user here, must add to array too
        let userBank = await fetchBank(msg.author);
        xpGain.push(msg.author.id);

        let increase = Math.floor(Math.random() * 11) + 10;
        let newlevel =  userBank.dataValues.level;
        let newCurrency = userBank.dataValues.currency;
        let inventory = JSON.parse(userBank.dataValues.inventory);

        if(inventory.includes('XP Booster')){
            increase = Math.floor(increase * 1.3);
        }
        increase += userBank.dataValues.current_xp;
        
        //Equation to handle if user should level up.
        if(increase >= 100 + ((newlevel - 1) * 75)){
            increase = 0;
            let currencyIncrease = 60 + ((newlevel - 1) * 5);
            let rubyEmoji = client.emojis.get('626941464991105057');
            let a = Math.floor((Math.random() * 21) + currencyIncrease);
            newCurrency +=  a;
            newlevel++;
            msg.channel.send(`${msg.author} is now LEVEL ${newlevel} and gained ${a}${rubyEmoji}!`);
        }

        await Users.update({
            current_xp: increase,
            level: newlevel,
            currency: newCurrency
        }, {where:{ user_id: msg.author.id}});

        //Clear the user from the array so that he can gain xp after a while
        setTimeout(() => {
            xpGain.splice(xpGain.indexOf(msg.author.id), 1);
        }, ((Math.random() * 11) + 15) * 1000);
    }
    //Leveling Logic END

    if(!msg.content.startsWith(prefix)) return;

    const arguments = msg.content.slice(prefix.length).split(/ +/);
    const commandName = arguments.shift();
    
    const command = client.commands.get(commandName) 
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if(!command) return;
    try{
        command.execute(msg, arguments, client);
    }
    catch{
        console.error;
    }
})

client.login(token);