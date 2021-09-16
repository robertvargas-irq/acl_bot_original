const { GuildMember, MessageEmbed } = require("discord.js");
const fs = require('fs');
const config = require('../../config.json')

module.exports = {
    name: 'embed',
    aliases: false,
    category: '📋 Administrative',
    description: "Sends a custom embed",
    usage: '<channel> ["title"] ["description"] ["field title", "field contents"]',
    
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
        
        var channelDirect = message.mentions.channels.first() || message.channel;
            if ( message.channel.id == channelDirect.id ) {
                channelDirect = false;
                message.delete();
            }

        // receive contents and adjust accordingly
        var contents = message.content.slice(message.content.indexOf(args[0])).trim();
            if (channelDirect) contents = message.content.slice(message.content.indexOf(args[1])).trim();

        const titleStart = contents.indexOf(`"`);
        const titleEnd = contents.indexOf(`"`, titleStart + 1);
        const title = contents.substring(titleStart + 1, titleEnd);
        contents = contents.slice(title.length + 2).trim();

        const descriptionStart = contents.indexOf(`"`);
        const descriptionEnd = contents.indexOf(`"`, descriptionStart + 1);
        const description = contents.substring(descriptionStart + 1, descriptionEnd);
        contents = contents.slice(description.length + 2).trim();

        const fieldTitleStart = contents.indexOf(`"`);
        const fieldTitleEnd = contents.indexOf(`"`, fieldTitleStart + 1);
        const fieldTitle = contents.substring(fieldTitleStart + 1, fieldTitleEnd);
        contents = contents.slice(fieldTitle.length + 2).trim();

        const fieldContentsStart = contents.indexOf(`"`);
        const fieldContentsEnd = contents.indexOf(`"`, fieldContentsStart + 1);
        const fieldContents = contents.substring(fieldContentsStart + 1, fieldContentsEnd);

        const colors = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/colors.json`) );
        const embed = new MessageEmbed()
            .setColor(colors.neutral);

        if (title) embed.setTitle(title);
        if (description) embed.setDescription(description);
        if (fieldTitle) embed.addField(fieldTitle, (fieldContents ? fieldContents : "⠀"));

        if (channelDirect) return message.guild.channels.cache.get(channelDirect.id).send(embed).then(message.react('👍'));
            else return message.channel.send(embed);

    }
}