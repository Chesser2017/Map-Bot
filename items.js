const items = [];
const {fetchBank} = require('./functions.js');
const Users = require('./db.js');
const Discord = require('discord.js');
const {slotMappings} = require('./commands/summon.js');

class Item {
    constructor(name, buyingName, description, cost, minLevel, performer){
        this.buyingName = buyingName;
        this.name = name;
        this.description = description;
        this.cost = cost;
        this.minLevel = minLevel;
        this.performer = performer;

        items.push(this);
    }
}

//NOTE: Inventory is stored as a string
const buyMinigame = async paramObj => {
    //Storing variables from parameter object
    const user = paramObj.user;
    const itemName = paramObj.itemName;
    const msg = paramObj.msg;
    const newCurrency = paramObj.newCurrency;

    const userBank = await fetchBank(user);
    const userInventory = JSON.parse(userBank.dataValues.inventory);
    
    if(userInventory.includes(itemName))
        return msg.reply(` you already bought that item!`);

    userInventory.push(itemName);
    await Users.update({
        inventory: JSON.stringify(userInventory),
        currency: newCurrency
    }, {where: {user_id: user.id}});

    msg.channel.send(`Successfully bought ${itemName}.`)
}
const buyXP = async paramObj => {
    //Storing variables from parameter object
    const user = paramObj.user;
    const msg = paramObj.msg;
    const newCurrency = paramObj.newCurrency;

    let userBank = await fetchBank(user);
    let userInventory = JSON.parse(userBank.dataValues.inventory);
    
    if(userInventory.includes('XP Booster'))
        return msg.reply(` you already bought that item! Please wait before trying to buy it again.`);

    userInventory.push('XP Booster');
    await Users.update({
        inventory: JSON.stringify(userInventory),
        currency: newCurrency
    }, {where: {user_id: user.id}});

    //Remove XP Boost after some time
    setTimeout(async() => {
        let usrBank = await fetchBank(user);
        let usrInventory = JSON.parse(usrBank.dataValues.inventory);

        usrInventory.splice(usrInventory.indexOf('XP Booster'), 1);

        await Users.update({
            inventory: JSON.stringify(usrInventory)
        }, {where: {user_id: user.id}});
    }, 1000 * 60 * 60 * 3);

    msg.channel.send(`Successfully bought XP Booster.`)
}
//User error handling is not done, but I'm not sure how to do it,
//will leave as is for now
const buyRole = async paramObj => {
    //Storing variables from parameter object
    const user = paramObj.user;
    const msg = paramObj.msg;
    const newCurrency = paramObj.newCurrency;

    const filter = m => m.author.id === user.id;
    const botMaking = msg.guild.channels.get('621148039200899072');

    //Collect messages, then push messages to answer array
    msg.channel.send(`Type, in 2 messages, first the name and then the colour(preferably hex code) of the role.`);
    const collected = await msg.channel.awaitMessages(filter, {time: 60000, max: 3});

    const answers = [];
    for(let msg of collected){
        answers.push(msg[1].content);
    }
    
    const customRole = await msg.guild.createRole({
        name: answers[0],
        color: answers[1],
        position: 31
    })

    botMaking.send(`User: ${user.tag}\nRole Name: ${answers[0]}\nRole Colour: ${answers[1]}`);

    msg.member.addRole(customRole);

    await Users.update({
        currency: newCurrency
    }, {where: {user_id: user.id}});

    return msg.channel.send(`Successfully purchased a custom role.`);
}
const buySlot = async paramObj => {
    //Storing variables from parameter object
    const user = paramObj.user;
    const msg = paramObj.msg;
    const client = paramObj.client;

    const userBank = await fetchBank(user);
    const currentSlotLevel = userBank.dataValues.slotLevel;

    if(currentSlotLevel >= 6)
        return msg.reply(` you are at the max slot level!`);

    let currency = userBank.dataValues.currency;
    const slotPrice = 750 + (250 * currentSlotLevel);

    const newSummoningTime = slotMappings[currentSlotLevel + 1].hours;
    const newAmountOfCrystals = slotMappings[currentSlotLevel + 1].crystals;
    let reply = new Discord.RichEmbed()
                    .setTitle(`Slot Upgrade`)
                    .setDescription(`Upgrading to slot level ${currentSlotLevel + 1} will make your wait time ${newSummoningTime} hours and produce ${newAmountOfCrystals} ${paramObj.acemoji}.\nReact to upgrade.`)
                    .addField(`Current Slot Level`, currentSlotLevel)
                    .addField(`Cost to Upgrade`, slotPrice);

    const sentMsg = await msg.channel.send(reply);
    await sentMsg.react('✅');
    await sentMsg.react('❎');

    client.on('messageReactionAdd', async(msgReaction, user) => {

        //Checks for correct message and user
        if(msgReaction.message.id != sentMsg.id || user.id != msg.author.id) return;

        if(msgReaction.emoji.name === '❎'){
            sentMsg.delete();
            return msg.reply(` did not upgrade slot.`)
        }
        if(msgReaction.emoji.name === '✅'){
            sentMsg.delete();
            currency -= +slotPrice;
            await Users.update({
                currency,
                slotLevel: currentSlotLevel + 1
            }, {where: {user_id: msg.author.id}})
            return msg.reply(` upgraded slot level!`);
        }
    })
}

new Item(`XP Booster`, `xp`,
    `Boosts your XP earned by 30% for 3 hours.`,
    200, 0, buyXP);

new Item(`Custom Role`, `custom-role`,
    `Gives a custom role for a week.`,
    3000, 0, buyRole); 

new Item(`Rock, Paper, Scissors`, `rps`,
    `Gives you access to play rock, paper, scissors, and if you win, you get +10 rubees`,
    0, 2, buyMinigame);

new Item(`Roulette`, `roulette`,
    `You can play roulette, and if you win, you earn +30 rubees`,
    0, 3, buyMinigame);

new Item(`Jackpot`, `jackpot`,
    `You have a very small chance in winning, ending up victorious gives you a profit of 150 rubees`,
    0, 5, buyMinigame);

new Item(`Upgrade Slot Level`, `slot`,
    `Upgrades your slot level, meaning faster summoning time and more crystals.`,
    'Varying', 0, buySlot);

module.exports = items;