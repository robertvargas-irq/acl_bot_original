const { GuildMember, MessageEmbed } = require("discord.js");
const config = require('../../config.json')

module.exports = {
    name: 'message',
    aliases: ['msg'],
    category: '📋 Administrative',
    description: "Sends a custom message",
    usage: '<channel> [message]',
    
    // Properties 
    guildOnly: true,
    args: true,
    cooldown: 1,

    execute(message, args) {

        // check to see if an administrator
        const isAdmin = message.member.permissions.has('ADMINISTRATOR');
            if (!isAdmin) return message.reply("you are not authorized to use that command!");

        // check for kosha
        if (message.author.id == '307322179421339649') {
            message.reply("you do not have the ability to use this command due to possible abuse reasons.").then(msg => msg.delete({timeout: 10 * 1000}));
            message.delete({timeout: 10 * 1000});
            return;
        }

        // check for a mentioned channel to send the message to
        var channelDirect = message.mentions.channels.first() || message.channel;
            if (message.channel.id == channelDirect.id) {
                channelDirect = false;
                message.delete();
            }

        // receive contents and adjust accordingly
        var contents = message.content.slice(message.content.indexOf(args[0])).trim();
            if (channelDirect) contents = message.content.slice(message.content.indexOf(args[1])).trim();

        // log contents
        const logContents = (`[cmd] ${message.author.username} has sent a custom message in #${channelDirect ? channelDirect : message.channel.name}(${message.guild.name})\n[---] Contents: ${contents}`);

        if (channelDirect) return message.guild.channels.cache.get(channelDirect.id).send(contents).then(message.react('👍')).then(console.log(logContents));
            else return message.channel.send(contents).then(console.log(logContents));
;
    }
}