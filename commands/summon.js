const {fetchBank} = require('../functions.js');
const Users = require('../db.js');
const Discord = require('discord.js');
const {ancientCrystalEmojiID} = require('../config.json');
const slotMappings = {
    1: {
        hours: 8,
        crystals: 5
    },
    2: {
        hours: 7,
        crystals: 5
    },
    3: {
        hours: 5,
        crystals: 5
    },
    4: {
        hours: 4,
        crystals: 7
    },
    5: {
        hours: 3,
        crystals: 7
    },
    6: {
        hours: 2.5,
        crystals: 10
    },
}
const currentlySummoning = [];
module.exports = {
    name: "summon",
    description: "Summon ancient crystals in a few hours. Amount and time depends on your slot level.",
    async execute(msg, args, client){
        //If the user is already summoning crystals
        if(currentlySummoning.includes(msg.author.id)){
            return msg.reply(` you are already summoning crystals! Please wait X before trying again`);
        }
        const userBank = await fetchBank(msg.author);
        const ACEmoji = client.emojis.get(ancientCrystalEmojiID);
        const hoursToSummonCrystals = slotMappings[userBank.dataValues.slotLevel].hours;
        const crystalsSummoned = slotMappings[userBank.dataValues.slotLevel].crystals;
        let summoned;
        let reply = new Discord.RichEmbed()
                        .setAuthor(client.user.username, client.user.avatarURL)
                        .setColor(`0xFF0000`)
                        .setDescription(`Summoning your ancient crystals ${ACEmoji}.\nYou can buy slots by using --buy slot to speed up your ancient crystal summoning and get more ancient crystals (maximum 10 ${ACEmoji} summoned at a time.)\nReact to perform the summoning.`)
                        .addField(`Current Slot Level`, userBank.dataValues.slotLevel)
                        .addField(`Wait time`,  `${hoursToSummonCrystals} hours`)
                        .addField(`Crystals summoned`, crystalsSummoned + ACEmoji.toString());

        const sentMsg = await msg.channel.send(reply);
        await sentMsg.react('✅');
        await sentMsg.react('❎');

        //After sending the message, listen for reaction
        client.on('messageReactionAdd', (msgReaction, user) => {
            //If the user isn't the same, or it's another message
            if((sentMsg.id != msgReaction.message.id) || (user.id != msg.author.id)) return;
        
            if(msgReaction.emoji.name === '❎'){
                sentMsg.delete();
                return msg.channel.send(`Did not start summoning crystals`);
            }
            if(msgReaction.emoji.name === '✅'){
                msg.channel.send(`Summoning your crystals, ${msg.author}!`);
        
                setTimeout(async() => {
                    const rare_currency = userBank.dataValues.rare_currency + crystalsSummoned;
                    await Users.update({rare_currency}, {where: {user_id: msg.author.id}});
                    summoned = true;
                    return msg.reply(` summoned your crystals!`);
                }, 1000 * 60 * 60 * hoursToSummonCrystals);
            }
            sentMsg.delete();
        });

        setTimeout(() => {
            if(summoned) return;
            sentMsg.delete();
            return msg.reply(` summoning expired.`);
        }, 1000 * 60 * 2);
    },
    aliases: [],
    modOnly: false,
    slotMappings
}