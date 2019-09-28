const Discord = require('discord.js');
const {fetchBank} = require('../functions.js');
const Users = require('../db.js');
const items = require('../items.js');

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

            for(let item of items){
                let description =  item.description.replace(`rubees`, rubyEmoji.toString());
                description += `\n - *Cost: ${item.cost}* ${rubyEmoji}\n - *Minimum Level: ${item.minLevel}*`;
                reply.addField(item.name, description);
            }

            return msg.channel.send(reply);
        }
        
        const item = items.find(i => i.buyingName === args[0].toLowerCase());
        
        if(!item) return msg.reply(` could not find item.`);

        const userBank = await fetchBank(msg.author);
        
        if(userBank.dataValues.currency < item.cost) return msg.reply(` you do not have enough ${rubyEmoji}!`);
        if(userBank.dataValues.level < item.minLevel) return msg.reply(` you need to be atleast LEVEL ${item.minLevel} to do that!`);
        
        let newCurrency = userBank.dataValues.currency - item.cost;
        item.performer({//Function to do when item is bought
            user: msg.author,
            itemName: item.name,
            msg,
            newCurrency
        });
    },
    aliases: ['get', 'b'],
    modOnly: false
}