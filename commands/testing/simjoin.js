const { GuildMember, MessageEmbed } = require("discord.js");
const fs = require('fs');
const config = require('../../config.json');

module.exports = {
    name: 'simjoin',
    aliases: false,
    category: 'OWNER',
    description: "For Team Staff or Team Reps to add or remove members from their team roster.",
    usage: '<add|remove> <@user> <@team>',
    
    // Properties 
    guildOnly: true,
    args: false,
    cooldown: 0,
    acl: true,
    ownerOnly: true,

    execute(message, args, client) {
        if ( message.author.id !== config.authorId )
            return message.channel.send(`You're not the owner!`);
        
        message.delete();
        
        if ( args[0] == 'true' ) {
            client.emit('guildMemberAdd', message.member);
            client.emit('guildMemberAdd', message.member);
            client.emit('guildMemberAdd', message.member);
            client.emit('guildMemberAdd', message.member);
            client.emit('guildMemberAdd', message.member);
            return client.emit('guildMemberAdd', message.member);
        }

        return client.emit('guildMemberAdd', message.member);
    }
}