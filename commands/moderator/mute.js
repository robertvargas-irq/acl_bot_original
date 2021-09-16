const { GuildMember, MessageEmbed, MessageAttachment } = require("discord.js");
const fs = require('fs');
const config = require('../../config.json');

module.exports = {
    name: 'mute',
    aliases: false,
    category: '🔰 Moderator',
    description: "Mute a member.",
    usage: '<@user> [optional reason]',
    
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

        // check if already muted
        if (target.roles.cache.has(mutedRole.id)) {
            embed
                .setDescription("**That user is already muted!**");
            return message.channel.send(embed);
        }

        // check if admin
        if (target.permissions.has('ADMINISTRATOR')) {
            embed
                .setDescription("**You cannot mute an Administrational Officer!**")
                .setColor(colors.negative);
            return message.channel.send(embed);
        }

        // mute
        target.roles.add(mutedRole.id);
        target.roles.remove(verifiedRole.id);
        let reply = `${target} has been successfully muted`;

        embed
            .setAuthor(`${target.user.username} has been successfully muted`, target.user.avatarURL())
            .addFields(
                { name: 'Moderator', value: message.author.username, inline: true },
                { name: 'Reason', value: reason, inline: true }
            )
            .setTimestamp(Date.now());
        
        let botUser = message.guild.members.cache.get(config.botId).user;
        let dmEmbed = new MessageEmbed()
            .setAuthor(botUser.username, botUser.avatarURL())
            .setTitle(`⚠ Notice of Server Mute`)
            .setColor(colors.negative)
            .setDescription(`Hey there! Just to inform you, unfortunately you have been issued a mute within **${message.guild.name}** by our moderator ${message.author}! If you believe this was a mistake, please contact one of the members of our higher staff for support, and please feel free to go over the server rules at <#${channels.rules}>!`)
            .addField("Reason", `${reason}`)
            .setTimestamp();
        
        target.send(dmEmbed);
        message.channel.send(embed);

    }
}