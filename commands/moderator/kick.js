const { GuildMember, MessageEmbed } = require("discord.js");
const fs = require('fs');
const config = require('../../config.json');

module.exports = {
    name: 'kick',
    aliases: false,
    category: '🔰 Moderator',
    description: "Kicks a user from the server.",
    usage: '<@user> [optional reason]',
    
    // Properties 
    guildOnly: true,
    args: true,
    cooldown: 3,

    execute(message,args) {
        const channels = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/channels.json`) );
        const colors = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/colors.json`) );

        const user = message.mentions.users.first();
            if (!user) return message.channel.send(new MessageEmbed()
                .setColor(colors.negative)
                .setTitle('Wait!')
                .setDescription('You need to @ a user for that!'));
        const member = message.guild.member(user);
        const reason = args.slice(1).join(' ') || 'None provided.';

        const embed = new MessageEmbed()
            .setAuthor(`${user.username} has been kicked from the server.`, user.avatarURL())
            .setColor(colors.positive)
            .addFields(
                { name: 'Moderator', value: `${message.author.username} (<@${message.author.id}>)`, inline: true },
                { name: 'Reason:', value: reason, inline: true }
            )
            .setTimestamp();

        var specifiedChannel = channels.banKickLog;
            if (!specifiedChannel) specifiedChannel = false;

        // check for permissions
        if (!message.member.permissions.has('KICK_MEMBERS')) return message.channel.send("You do not have the authorization to use this command.");

        // check for self-kick
        if (message.author.id == user.id) return message.channel.send("As flexible as you are, you cannot kick yourself!");

        if (message.author.id == '307322179421339649') {
            embed
                .setTitle("Error")
                .setDescription("Kosha cannot kick.")
                .setFooter("lol");
            message.channel.send(embed);
            message.channel.send("<@&743869641507733616> Kosha tried to ban someone");
            return;
        }

        // check for kickability
        if (message.mentions.members.first().permissions.has('ADMINISTRATOR')) return message.channel.send("That user cannot be kicked!");
        
        if (user) {
            if (member) {
                member
                    .kick(reason)
                    .then(() => {
                        if (specifiedChannel) {
                            message.guild.channels.cache.get(specifiedChannel).send(embed);
                        } else message.channel.send(embed);
                    })
                    .catch(err => {
                        message.reply('I was unable to kick the member');
                        console.error(err);
                    });
            }
            else {
                message.reply("That user isn't in this server!");
            }
        }
        else {
            message.reply("You didn't mention the user to kick!");
        }

    }
}