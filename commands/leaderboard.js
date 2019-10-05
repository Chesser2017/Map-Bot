const Users = require('../db.js');
const Discord = require('discord.js');
const {rubyEmojiID} = require('../config.json');
module.exports = {
    name: "leaderboard",
    description: "Displays the top 10 users in the server",
    async execute(msg, args, client){
        
        const userBanks = await Users.findAll({attributes: ['user_id', 'currency']});
        const rubyEmoji = client.emojis.get(rubyEmojiID);
        let leaderboard = [];

        //The pages inside this object is mapped by page number, with the value
        //being a string
        const pages = {};

        //Gets database of users, then sorts and stores it
        for(let bank of userBanks){
            leaderboard.push(bank.dataValues);
        }
        leaderboard.sort((a, b) => b.currency - a.currency);

        //Creates a reply embed
        let reply = new Discord.RichEmbed()
                        .setAuthor(client.user.username, client.user.avatarURL)
                        .setTitle('Leaderboard');
        
        let userList = '';
        let lastPageFromIteration;

        for(let i = 0; i < leaderboard.length; i++){
            let user = await client.fetchUser(leaderboard[i].user_id);
            switch(i){
                case 0:
                    userList += `\:first_place: ${user} \`${leaderboard[i].currency}\` ${rubyEmoji}\n`;
                    break;
                case 1:
                    userList += `\:second_place: ${user} \`${leaderboard[i].currency}\` ${rubyEmoji}\n`;
                    break;
                case 2:
                    userList += `\:third_place: ${user} \`${leaderboard[i].currency}\` ${rubyEmoji}\n`;
                    break;
                default:
                    userList += `**${i+1}.** ${user} \`${leaderboard[i].currency}\` ${rubyEmoji}\n`;
                    
                    //When there are 10 people found, split the leaderboard and store it in
                    //pages object. userList is made blank so that no repetition occurs
                    if((i + 1) % 10 === 0){
                        pages[(i + 1)/10] = userList;
                        userList = '';
                        lastPageFromIteration = (i + 1)/10;
                    }
                    break;
            }
        }
        
        reply.setDescription(pages['1']);
        //The remaining users are added to pages, assuming they exist
        userList ? pages[lastPageFromIteration + 1] = userList : userList = userList;

        const sentMsg = await msg.channel.send(reply);
        sentMsg.page = 1;
        await sentMsg.react('⬅');
        await sentMsg.react('➡');

        client.on('messageReactionAdd', (msgReaction, user) => {
            if(user.id != msg.author.id || msgReaction.message.id != sentMsg.id) return;

            if(msgReaction.emoji.name === '⬅'){
                if(sentMsg.page - 1 >= 1)
                    sentMsg.page --;
            }
            if(msgReaction.emoji.name === '➡'){
                if(pages[sentMsg.page + 1])
                    sentMsg.page++;
            }
            reply.setDescription(pages[sentMsg.page]);
            sentMsg.edit(reply);
            msgReaction.remove(user);
        })
    },
    aliases: ['lb', 'top'],
    modOnly: false
}