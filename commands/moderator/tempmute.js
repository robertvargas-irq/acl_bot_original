const { GuildMember, MessageEmbed, MessageAttachment } = require("discord.js");
const fs = require('fs');
const config = require('../../config.json');

module.exports = {
    name: 'tempmute',
    aliases: false,
    category: '🔰 Moderator',
    description: "Mute a member for a specific amount of time.",
    usage: '<@user> <time [s, m, h, d, inf]> [optional reason]',
    
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
        const initTime = Date.now();
        var reason = args.slice(1).join(' ') || 'None provided.';
        var time = 0;

        const embed = new MessageEmbed().setColor(colors.neutral);

        // check for manage messages
        if (!message.member.permissions.has('MANAGE_MESSAGES')) {
            embed
                .setDescription("**You do not have permission to mute!**")
                .setColor(colors.negative);
            return message.channel.send(embed);
        }

        // check if time is valid and convert
        var timeMultiplierPosition = args[1].indexOf('s') || args[1].indexOf('m') || args[1].indexOf('h') || args[1].indexOf('d')
        var timeMultiplier = args[1].slice(timeMultiplierPosition).trim();
        var time = args[1].slice(0, timeMultiplierPosition).trim();
            switch (timeMultiplier) {
                case 'd':
                    time *= 24;
                    
                case 'h':
                    time *= 60;
                    
                case 'm':
                    time *= 60;

                case 's':
                    time *= 1000;
                    break;

                default:
                    embed
                        .setDescription("Please provide a timecode! Eg: {10s, 1m, 1h, 1d}")
                        .setColor(colors.negative);
                    message.channel.send(embed);
                    return;
            }

        // give error if no integer is provided
        if (args[1]) {
            if (!Number.isInteger(parseInt(time))) {
                embed
                    .setDescription(`**"${args[1]}" is not a valid input for time!**\n${config.prefix}${this.name} ${this.usage}`)
                    .setColor(colors.negative);
                message.channel.send(embed);
                return;
            }
        }

        let dayInMs = (5 * 24 * 60 * 60 * 1000);
        if (time > dayInMs) {
            message.channel.send("Due to the nature of the bot, the time cannot exceed 5 days! Your time input has been defaulted to 1 day.");
            time = dayInMs;
        }

        // mute
        target.roles.add(mutedRole.id);
        target.roles.remove(verifiedRole.id);

        embed
            .setAuthor(`${target.user.username} has been successfully muted for ${args[1]}.`, target.user.avatarURL())
            .addFields(
                { name: 'Moderator', value: message.author.username, inline: true },
                { name: 'Reason', value: reason, inline: true }
            )
            .setFooter('Est. unmute time:')
            .setTimestamp(initTime + time);

        let botUser = message.guild.members.cache.get(config.botId).user;    
        let dmEmbed = new MessageEmbed()
            .setAuthor(botUser.username, botUser.avatarURL())
            .setTitle(`⚠ Notice of Temporary Server Mute`)
            .setColor(colors.neutral)
            .setDescription(`Hey there! Just to inform you, unfortunately you have been issued a temporary mute within **${message.guild.name}** by our moderator ${message.author}! If you believe this was a mistake, please contact one of the members of our higher staff for support, and please feel free to go over the server rules at <#${channels.rules}>!`)
            .addFields(
                { name: 'Mute Length', value: args[1], inline: true },
                { name: 'Reason', value: reason, inline: true }
            )
            .setFooter('Est. unmute time:')
            .setTimestamp(initTime + time);
        
        target.send(dmEmbed);
        
        try {

            var unmutedEmbed = new MessageEmbed()
                .setColor(colors.positive)
                .setAuthor(`${target.user.username}'s tempmute has expired.`, target.user.avatarURL())
                .addFields(
                    { name: "Original Moderator", value: message.author.username, inline: false },
                    { name: "Original Time", value: args[1], inline: true },
                    { name: "Original Reason", value: reason, inline: true }
                )
                .setFooter('Initial Mute time:')
                .setTimestamp(initTime);

            message.channel.send(embed)
                .then(msg => {
                    setTimeout(() => {
                        //msg.edit({
                          //  content: unmutedEmbed
                        //});
                        message.channel.send(unmutedEmbed)
                    }, time);
                })
                .catch(e => console.log(e));
        }
        catch(e) {
            console.log(e);
        }
        // timeout
        setTimeout(() => unmuteUser(), time);

        async function unmuteUser() {

            await message.guild.members.fetch(target.id);

            if (target.roles.cache.has(mutedRole.id)){
                let botUser = message.guild.members.cache.get(config.botId).user;
                let newDmEmbed = new MessageEmbed()
                    .setAuthor(botUser.username, botUser.avatarURL())
                    .setColor(colors.neutral)
                    .setDescription(`Hey there! Your ${args[1]} long temporary mute in **${message.guild.name}** has expired! Get back to chatting, and don't forget to brush up on the rules at <#${channels.rules}>!`)
                    .setTimestamp();
                try {
                    target.send(newDmEmbed);
                }
                catch(e) {
                    console.log(e);
                }
                
                target.roles.remove(mutedRole.id);
                target.roles.add(verifiedRole.id);
            }

        }

    }
}