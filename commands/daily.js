const usedDaily = [];
const {fetchBank} = require('../functions.js');
const Users = require('../db.js');
const {rubyEmojiID} = require('../config.json');
const msToTime = duration => {
    let seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return `${hours}h:${minutes}m:${seconds}s`;
}
module.exports = {
    name: "daily",
    description: "Get a daily amount of rubees according to your level.",
    async execute(msg, args, client){
        const userFoundInDailyArray = usedDaily.find(user => user.id === msg.author.id);

        if(userFoundInDailyArray){
            //Takes how much time has passed, subtracts it from a day and returns the formatted time
            const timeTilNextDaily = msToTime(86400000 - (Date.now() - userFoundInDailyArray.time));
            return msg.reply(` you already used your daily! Please wait ${timeTilNextDaily} to do it again.`);
        }

        usedDaily.push({id: msg.author.id, time: Date.now()});

        const rubyEmoji = client.emojis.get(rubyEmojiID);
        const userBank = await fetchBank(msg.author);
        const minForDailyAmount = 70 + (userBank.dataValues.level * 10);
        
        const dailyAmount = Math.floor(Math.random() * 21) + minForDailyAmount;

        const currency = userBank.dataValues.currency + dailyAmount;

        await Users.update({currency}, {where: {user_id: msg.author.id}});

        return msg.reply(`You got your daily amount of ${rubyEmoji}. It was ${dailyAmount} ${rubyEmoji}!`);
    },
    aliases: [],
    modOnly: false
}