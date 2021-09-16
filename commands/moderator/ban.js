const { GuildMember, MessageEmbed } = require("discord.js");
const fs = require('fs');
const config = require('../../config.json');

module.exports = {
    name: 'ban',
    aliases: false,
    category: '🔰 Moderator',
    description: "Bans a user from the server.",
    usage: '<@user> [optional reason]',
    
    // Properties 
    guildOnly: true,
    args: true,
    cooldown: 3,
    modsOnly: true,

    execute(message,args) {

        const channels = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/channels.json`) );
        const roles = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/roles.json`) );
        const colors = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/colors.json`) );
        
        const user = message.mentions.users.first();
            if (!user) return message.channel.send(new MessageEmbed()
                .setColor(colors.negative)
                .setTitle('Wait!')
                .setDescription('You need to @ a user for that!'));
        const member = message.guild.member(user);
        let reason = args.slice(1).join(' ') || 'None provided.';
        
        const embed = new MessageEmbed()
            .setAuthor(`${user.username} has been banned from the server.`, user.avatarURL())
            .setColor(colors.positive)
            .addFields(
                { name: 'Moderator', value: `${message.author.username} (<@${message.author.id}>)`, inline: true },
                { name: 'Reason:', value: reason, inline: true }
            )
            .setTimestamp();

        var specifiedChannel = channels.banKickLog;
            if (!specifiedChannel) specifiedChannel = false;

        // check for permissions
        if (!message.member.permissions.has('BAN_MEMBERS')) return message.channel.send("You do not have the authorization to use this command.");

        // check for kosha
        if (message.author.id == '307322179421339649') {
            embed
                .setTitle("Error")
                .setDescription("Kosha cannot ban.")
                .setFooter("lol");
            message.channel.send(embed);
            message.channel.send("<@&743869641507733616> Kosha tried to ban someone");
            return;
        }

        // check for self-ban
        if (message.author.id == user.id) return message.channel.send("You cannot ban yourself!");

        // check if bannable
        if (message.mentions.members.first().permissions.has('ADMINISTRATOR')) return message.channel.send("That user cannot be banned!");

        if (user) {
            if (member) {
                member
                    .ban({
                        reason: reason,
                    })
                    .then(() => {
                        if (specifiedChannel) {
                            message.guild.channels.cache.get(specifiedChannel).send(embed);
                        } else message.channel.send(embed);
                    })
                    .catch(err => {
                        message.reply('I was unable to ban the member');
                        console.error(err);
                    });
            }
            else {
                message.reply("That user isn't in this server!");
            }
        }
        else {
            message.reply("You didn't mention the user to ban!");
        }

    }
}