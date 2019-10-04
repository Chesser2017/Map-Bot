const Users = require('../db.js');
const {fetchBank} = require('../functions.js');

module.exports = {
    name: "jackpot",
    description: "Play jackpot! You have a small chance of winning though.",
    async execute(msg, args, client){
        const rubyEmoji = client.emojis.get('626941464991105057');
        const userBank = await fetchBank(msg.author);
        const inventory = JSON.parse(userBank.dataValues.inventory);
        let currency = userBank.dataValues.currency;

        if(!inventory.includes('Jackpot'))
            return msg.reply(` you have to buy jackpot from the store!`);
        
        const randNum = Math.floor(Math.random() * 10);

        if(randNum === 7){
            currency += 150;
            await Users.update({currency},
                 {where: {user_id: msg.author.id}});
            return msg.reply(` you won and have gained 150 ${rubyEmoji}`);
        }
        currency -= 15;
        await Users.update({currency}, 
            {where: {user_id: msg.author.id}});
        return msg.reply(` you lost 15 ${rubyEmoji}.`);
    },
    aliases: ['jp', 'pot'],
    modOnly: false
}