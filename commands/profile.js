const {fetchBank} = require('../functions.js');
const Discord = require('discord.js');
const Users = require('../db.js');
module.exports = {
    name: 'profile',
    description: 'Displays a users profile',
    async execute(msg, args, client){
        let user = msg.mentions.users.first() || msg.author;
        let userBank = await fetchBank(user);
        return msg.channel.send(`USER: ${user}, CURRENCY: ${userBank.dataValues.currency}, LEVEL: ${userBank.dataValues.level}, XP: ${userBank.dataValues.current_xp} / ${100 + ((userBank.dataValues.level - 1) * 75)}`)
    },
    aliases: ['p', 'prof'],
    modOnly: false
}