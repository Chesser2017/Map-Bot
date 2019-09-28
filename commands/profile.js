const {fetchBank} = require('../functions.js');
const Discord = require('discord.js');
const Users = require('../db.js');
module.exports = {
    name: 'profile',
    description: 'Displays a users profile',
    async execute(msg, args, client){
        let user = msg.mentions.users.first() || msg.author;
        let userBank = await fetchBank(user);
        let rubyEmoji = client.emojis.get('626941464991105057');
        let inventory = JSON.parse(userBank.dataValues.inventory);
        let string = '';
        for(let i = 0; i < inventory.length; i++){
            if(i != inventory.length - 1)
                string += inventory[i] + " | ";
            else{
                string += inventory[i];
            }
        }
        if(string === '') string = 'No Items';
        let reply = new Discord.RichEmbed()
                            .setAuthor(`${user.username}`, `${user.avatarURL}`)
                            .setDescription(`-----------------------------------------`)
                            .setThumbnail(`${user.avatarURL}`)
                            .addField(`User Info:`, `Level\n${userBank.dataValues.level}\n\nXP\n${userBank.dataValues.current_xp}/${100 + ((userBank.dataValues.level - 1) * 75)}\n\nRubees${rubyEmoji}\n${userBank.dataValues.currency}`)
                            .addField(`Inventory`, string);
        return msg.channel.send(reply);
    },
    aliases: ['p', 'prof'],
    modOnly: false
}