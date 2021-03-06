const Users = require('../db.js');
const {fetchBank} = require('../functions.js');
const {rubyEmojiID} = require('../config.json');
module.exports = {
    name: "jackpot",
    description: "Play jackpot! You have a small chance of winning though.",
    async execute(msg, args, client){
        const rubyEmoji = client.emojis.get(rubyEmojiID);
        const userBank = await fetchBank(msg.author);
        const inventory = JSON.parse(userBank.dataValues.inventory);
        let currency = userBank.dataValues.currency;

        if(!inventory.includes('Jackpot'))
            return msg.reply(` you have to buy jackpot from the store!`);
        
        const randNum = Math.floor(Math.random() * 20);

        if(randNum === 7){
            currency += 2000;
            await Users.update({currency},
                 {where: {user_id: msg.author.id}});
            return msg.reply(` you won and have gained 2000 ${rubyEmoji}!`);
        }
        currency -= 150;
        currency < 0 ? currency = 0 : currency = currency;
        await Users.update({currency}, 
            {where: {user_id: msg.author.id}});
        return msg.reply(` you lost 150 ${rubyEmoji}.`);
    },
    aliases: ['jp', 'pot'],
    modOnly: false
}