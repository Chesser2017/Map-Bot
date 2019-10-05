const {fetchBank} = require('../functions.js');
const Discord = require('discord.js');
const Users = require('../db.js');
const {rubyEmojiID, ancientCrystalEmojiID} = require('../config.json');
module.exports = {
    name: 'profile',
    description: 'Displays a users profile',
    async execute(msg, args, client){
        const user = msg.mentions.users.first() || msg.author;
        if(user.bot) return;
        const userBank = await fetchBank(user);
        const rubyEmoji = client.emojis.get(rubyEmojiID);
        const ACEmoji = client.emojis.get(ancientCrystalEmojiID);
        const inventory = JSON.parse(userBank.dataValues.inventory);
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
                            .addField(`User Info:`, `Level\n${userBank.dataValues.level}\n\nXP\n${userBank.dataValues.current_xp}/${100 + ((userBank.dataValues.level - 1) * 75)}\n\nRubees${rubyEmoji}\n${userBank.dataValues.currency}\n\nAncient Crystals${ACEmoji}\n${userBank.dataValues.rare_currency}\n\nSlot Level: ${userBank.dataValues.slotLevel}`)
                            .addField(`Inventory`, string);
        return msg.channel.send(reply);
    },
    aliases: ['p', 'prof'],
    modOnly: false
}