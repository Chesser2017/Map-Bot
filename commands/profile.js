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
        let reply = new Discord.RichEmbed()
                            .setAuthor(`${user.username}`, `${user.avatarURL}`)
                            .setDescription(`-----------------------------------------`)
                            .setThumbnail(`${user.avatarURL}`)
                            .addField(`User Info:`, `Level\n${userBank.dataValues.level}\n\nXP\n${userBank.dataValues.current_xp}/${100 + ((userBank.dataValues.level - 1) * 75)}\n\nRubees${rubyEmoji}\n${userBank.dataValues.currency}`);
        return msg.channel.send(reply);
    },
    aliases: ['p', 'prof'],
    modOnly: false
}