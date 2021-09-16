const { GuildMember, MessageEmbed } = require("discord.js");
const fs = require('fs');
const config = require('../../config.json');

module.exports = {
    name: 'unmute',
    aliases: false,
    category: '🔰 Moderator',
    description: "Unmute this member.",
    usage: '<@user>',
    
    // Properties 
    guildOnly: true,
    args: true,
    cooldown: 1,

    execute(message,args) {
        const guildID = message.guild.id;
        const fetchRole = (id) => message.guild.roles.cache.get(id);
        const channels = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/channels.json`) );
        const roles = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/roles.json`) );
        const colors = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/colors.json`) );

        
        const verifiedRole = fetchRole(roles.verified);
        const mutedRole = fetchRole(roles.muted);

        const target = message.mentions.members.first() || args[0];
        const reason = args.slice(1).join(' ') || 'None provided.';

        const embed = new MessageEmbed().setColor(colors.neutral);

        // check for manage messages
        if (!message.member.permissions.has('MANAGE_MESSAGES')) {
            embed
                .setDescription("**You do not have permission to mute!**")
                .setColor(colors.negative);
            return message.channel.send(embed);
        }

        // check if already unmuted
        if (target.roles.cache.has(verifiedRole.id)) {
            embed
                .setDescription("**That user is already unmuted!**")
                .setColor(colors.negative);
            return message.channel.send(embed);
        }

        // unmute
        target.roles.add(verifiedRole.id);
        target.roles.remove(mutedRole.id);
        embed
            .setAuthor(`${target.user.username} has been successfully unmuted`, target.user.avatarURL())
            .addFields(
                { name: 'Moderator', value: `${message.author.username} (<@${message.author.id}>)`, inline: true },
                { name: 'Reason', value: reason, inline: true }
            )
            .setTimestamp();

        let rulesChannel = require('../../data/rules_channel.json');
        let botUser = message.guild.members.cache.get(config.botId).user;
        let dmEmbed = new MessageEmbed()
            .setAuthor(botUser.username, botUser.avatarURL())
            .setColor(colors.neutral)
            .setDescription(`Hey there! Your mute in **${message.guild.name}** has been lifted by ${message.author}! Get back to chatting, and don't forget to brush up on the rules at <#${rulesChannel.getChannel[message.guild.id]}>!`)
            .setTimestamp();
        target.send(dmEmbed);

        message.channel.send(embed);


    }
}