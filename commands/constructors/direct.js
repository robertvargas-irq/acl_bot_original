const { GuildMember, MessageEmbed } = require("discord.js");
const fs = require('fs');
const config = require('../../config.json')

module.exports = {
    name: 'direct',
    aliases: false,
    category: '📋 Administrative',
    description: "Sends a custom embed",
    usage: '<channel> ["title"] ["description"] ["field title", "field contents"]',
    
    // Properties 
    guildOnly: true,
    args: true,
    cooldown: 1,

    async execute(message, args) {
        if ( message.author.id !== process.env.AUTHORID ) return message.reply('❌');

        const team = message.mentions.roles.first();
        if ( !team ) return;
        const members = team.members;
        const announcement = message.content.slice( message.content.indexOf('>') + 1 ).trim();

        await members.forEach(async m => {
            message.client.users.cache.get(m.id).send(new MessageEmbed().setColor('#d69f9a').setDescription(announcement));
        });
        console.log({
            messageAuthor: `${message.author.username} (id: ${message.author.id})`,
            messageTarget: `${team.name} (id: ${team.id})`,
            messageRecipients: members.map( m => m.user.username ),
        });

        message.react('👍');
    }
}