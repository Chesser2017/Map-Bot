module.exports = {
    name: 'ping',
    description: 'Pong',
    execute(msg, args, client){
        msg.reply('pong');
    },
    aliases: ['pingeroo', 'pingi'],
    modOnly: false
}