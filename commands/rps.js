const {fetchBank} = require('../functions.js');
const Users = require('../db.js');

module.exports = {
    name: "rps",
    description: "Play rock paper scissors. Use it like .rps rock",
    async execute(msg, args, client){
        const rubyEmoji = client.emojis.get('626941464991105057');
        const userBank = await fetchBank(msg.author);
        const userInventory = JSON.parse(userBank.dataValues.inventory);
        let currency = userBank.dataValues.currency;

        //Error handling
        if(!userInventory.includes(`Rock, Paper, Scissors`))
            return msg.reply(` you must buy the RPS item from the shop!`);
        if(args.length < 1)
            return msg.reply(` you must provide what choice you chose!`);
        if(args[0].toLowerCase() === 'gun'){
            currency -= 100;
            currency < 0 ? currency = 0 : currency = currency;
            await Users.update({currency}, {where: {user_id: msg.author.id}});
            return msg.channel.send(`...really. You lose 100 ${rubyEmoji} for that.`);
        }

        let userWon = false;
        let tie = false;
        const userChoice = args[0].toLowerCase();
        const botChoice = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];

        //Checks who won
        if(userChoice === 'rock'){
            if(botChoice === 'paper') userWon = false;
            if(botChoice === 'scissors') userWon = true;
            if(botChoice === 'rock') tie = true;
        }
        else if(userChoice === 'paper'){
            if(botChoice === 'scissors') userWon = false;
            if(botChoice === 'rock') userWon = true;
            if(botChoice === 'paper') tie = true;
        }
        else if(userChoice === 'scissors'){
            if(botChoice === 'rock') userWon = false;
            if(botChoice === 'paper') userWon = true;
            if(botChoice === 'scissors') tie = true;
        }
        else {
            return msg.reply(` argument not recognized. You lose by default.`);
        }
        console.log(botChoice, userChoice);
        //Finishes the game
        if(tie)
            return msg.reply(` you chose ${userChoice} and I chose ${botChoice}. We tied!`);
        if(userWon){
            currency += 10;
            await Users.update({currency}, {where: {user_id: msg.author.id}});
            return msg.reply(` you chose ${userChoice} and I chose ${botChoice}. You won and gained 10 ${rubyEmoji}!`);
        }
        return msg.reply(` you chose ${userChoice} and I chose ${botChoice}. You lost.`);
    },
    aliases: [],
    modOnly: false
}