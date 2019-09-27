const Users = require('../db.js');
const {fetchBank} = require('../functions.js');
const Discord = require('discord.js');
module.exports = {
    name: 'r',
    description: 'Changes the rubees of a user depending on arguments. Use ".r add/subtract amount (user) or .r reset (user)"',
    async execute(msg, args, client){
        //ADMIN and RUBEE BANKER role check
        if(!msg.member.roles.has('625868222339481600') && !msg.member.roles.has('601938916869799937')) return msg.reply(', you must be a Rubee Banker or Admin!');
        
        let user = msg.mentions.users.first() || msg.author;
        let rubyEmoji = client.emojis.get('626941464991105057');

        if(args[0] === "add"){
            let rubeesToAdd = parseInt(args[1]);
            if(isNaN(rubeesToAdd) || rubeesToAdd < 1) return msg.reply(`, number must be positive integer.`);
            let userBank = await fetchBank(user);
            let newCurrency = userBank.dataValues.currency + rubeesToAdd;
            await Users.update({
                currency: newCurrency
            }, {where: {user_id: user.id}});
            let reply = new Discord.RichEmbed()
                            .setAuthor(`${user.username}`, `${user.avatarURL}`)
                            .setColor(`0xffc0cb`)
                            .addField(`Rubees ${rubyEmoji}`, `Added ${rubeesToAdd}${rubyEmoji} to ${user}.`);
            return msg.channel.send(reply);
        }
        else if(args[0] === "subtract"){
            let rubeesToRemove = parseInt(args[1]);
            if(isNaN(rubeesToRemove) || rubeesToRemove < 1) return msg.reply(`, number must be positive integer.`);
            
            let userBank = await fetchBank(user);
            let newCurrency = userBank.dataValues.currency - rubeesToRemove;
            if(newCurrency < 0) newCurrency = 0;

            await Users.update({
                currency: newCurrency
            }, {where: {user_id: user.id}});
            let reply = new Discord.RichEmbed()
                            .setAuthor(`${user.username}`, `${user.avatarURL}`)
                            .setColor(`0xffc0cb`)
                            .addField(`Rubees ${rubyEmoji}`, `Removed ${rubeesToRemove}${rubyEmoji} from ${user}.`);
            return msg.channel.send(reply);
        }
        else if(args[0] === "reset"){
            if(!msg.mentions.users.first()) return msg.reply(`, you must meniton a user.`);
            await Users.update({
                currency: 0
            }, {where: {user_id: user.id}});
            let reply = new Discord.RichEmbed()
                            .setAuthor(`${user.username}`, `${user.avatarURL}`)
                            .setColor(`0xffc0cb`)
                            .addField(`Rubees ${rubyEmoji}`, `Reset ${rubyEmoji} for ${user}`);
            return msg.channel.send(reply);
        }
    },
    modOnly: true,
    aliases: ['a', 'increase']
}