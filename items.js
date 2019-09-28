const items = [];
const {fetchBank} = require('./functions.js');
const Users = require('./db.js');

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
const buyItem = async paramObj => {
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
    const user = paramObj.user;
    const msg = paramObj.msg;
    const newCurrency = paramObj.newCurrency;
    const filter = m => m.author.id === user.id;

    //Collect messages, then push messages to answer array
    msg.channel.send(`Type, in 2 messages, first the color(hex code) and then the name of the role.`);
    const collected = await msg.channel.awaitMessages(filter, {time: 60000, max: 3});
    const answers = [];
    for(let msg of collected){
        answers.push(msg[1].content);
    }
    
    const role = await msg.guild.createRole({
        color: answers[0],
        name: answers[1],
        position: 52
    })
    
    msg.member.addRole(role);
    await Users.update({
        currency: newCurrency
    }, {where: {user_id: user.id}});

    setTimeout(() => {
        role.delete();
    }, 1000 * 60 * 60 * 24 * 7);

    return msg.channel.send(`Successfully purchased a custom role.`)
}
new Item(`XP Booster`, `xp`,
    `Boosts your XP earned by 30% for 3 hours.`,
    200, 0, buyXP);

new Item(`Custom Role`, `custom-role`,
    `Gives a custom role for a week.`,
    1000, 0, buyRole); 

new Item(`Rock, Paper, Scissors`, `rps`,
    `Gives you access to play rock, paper, scissors, and if you win, you get +10 rubees`,
    0, 2, buyItem);

new Item(`Roulette`, `roulette`,
    `You can play roulette, and if you win, you earn +30 rubees`,
    0, 3, buyItem);

new Item(`Jackpot`, `jackpot`,
    `You have a very small chance in winning, ending up victorious gives you a profit of 150 rubees`,
    0, 5, buyItem);


module.exports = items;