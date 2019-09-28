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
new Item(`XP Booster`, `xp`,
    `Boosts your XP earned by 30% for 3 hours.`,
    200, 0, buyXP);

new Item(`Custom Role`, `custom-role`,
    `Gives a custom role for a week.`,
    1000, 0, () => {
        console.log(`NOT DONE YET.`);
}); 

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