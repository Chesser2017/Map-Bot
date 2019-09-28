const Discord = require('discord.js');
const {fetchBank} = require('../functions.js');
const Users = require('../db.js');
const totalItems = [];

class Item {
    constructor(name, buyingName, description, cost, minLevel, performer){
        this.buyingName = buyingName;
        this.name = name;
        this.description = description;
        this.cost = cost;
        this.minLevel = minLevel;
        this.performer = performer;

        totalItems.push(this);
    }
}

new Item(`XP Booster`, `xp`,
    `Boosts your XP earned by 30% for 3 hours.`,
    200, 0, () => {
            console.log(`Called function XP BOOSTER!`);    
});

new Item(`Custom Role`, `custom-role`,
    `Gives a custom role for a week.`,
    1000, 0, () => {
            console.log(`Called function CUSTOM ROLE!`);
}); 

new Item(`Rock, Paper, Scissors`, `rps`,
    `Gives you access to play rock, paper, scissors, and if you win, you get +10 rubees`,
    0, 2, () => {
            console.log(`Called function RPS!`);
});

new Item(`Roulette`, `roulette`,
    `You can play roulette, and if you win, you earn +30 rubees`,
    0, 3, () => {
            console.log(`Called function ROULETTE!`);
});

new Item(`Jackpot`, `jackpot`,
    `You have a very small chance in winning, ending up victorious gives you a profit of 150 rubees`,
    0, 5, () => {
            console.log(`Called function JACKPOT!`);
});

module.exports = {
    name: "buy",
    description: "Buy an item from the shop. Use it like .buy (item_name)",
    async execute(msg, args, client){
        const rubyEmoji = client.emojis.get('626941464991105057');
        if(args.length < 1){
            let reply = new Discord.RichEmbed()
                        .setAuthor(client.user.username, client.user.avatarURL)
                        .setTitle(`Shop Items`)
                        .setColor(`0xFF0000`);

            for(let item of totalItems){
                let description =  item.description.replace(`rubees`, rubyEmoji.toString());
                description += `\n - *Cost: ${item.cost}* ${rubyEmoji}\n - *Minimum Level: ${item.minLevel}*`;
                reply.addField(item.name, description);
            }

            return msg.channel.send(reply);
        }
        
        const item = totalItems.find(i => i.buyingName === args[0].toLowerCase());
        
        if(!item) return msg.reply(` could not find item.`);

        const userBank = await fetchBank(msg.author);
        
        if(userBank.dataValues.currency < item.cost) return msg.reply(` you do not have enough ${rubyEmoji}!`);
        if(userBank.dataValues.level < item.minLevel) return msg.reply(` you need to be atleast LEVEL ${item.minLevel} to do that!`);

        let newCurrency = userBank.dataValues.currency - item.cost;
        await Users.update({
            currency: newCurrency
        }, {where: {user_id: msg.author.id}});
        msg.channel.send(`Succesfully bought ${item.name}! You now have ${newCurrency} ${rubyEmoji}.`);
        item.performer();
    },
    aliases: ['get', 'b'],
    modOnly: false
}