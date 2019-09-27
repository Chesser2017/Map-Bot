const Discord = require('discord.js');
const fs = require('fs');
const {prefix} = require('../config.json');

const files = new Discord.Collection(); 

//Sets command objects inside of files 
const commandFiles = fs.readdirSync('./commands')
.filter(file => file.endsWith('.js') && !file.startsWith('help'));

for(const file of commandFiles){
    const command = require(`./${file}`);
    files.set(command.name, command);
}

module.exports = {
    name: "help",
    aliases: ['commands', 'cmds', 'h'],
    cooldown: 15,
    execute(msg, args, client){

        const commands = new Discord.RichEmbed()
            .setColor(`#eb4c34`)    
            .setTitle(`Commands`);

        const modCommands = new Discord.RichEmbed()
            .setColor('#eb4c34')
            .setTitle(`Restricted Commands`)

        for(let command of files){

            let name = command[1].name;
            let description = command[1].description;
            let aliases = command[1].aliases || ``;
            if(command[1].modOnly){
                modCommands.addField(`**Name**: ${prefix}${name} [${aliases}]`,
                            `**Description**: ${description}`,
                            false);
            }else{
                commands.addField(`**Name**: ${prefix}${name} [${aliases}]`,
                            `**Description**: ${description}`,
                            false);
            }
        }
        msg.channel.send(commands)
            .then(msg => {
                msg.channel.send(modCommands);
            });
    }
}