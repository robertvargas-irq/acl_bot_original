const { MessageEmbed } = require('discord.js');
const { Collection } = require('discord.js');
const fs = require('fs');
const { authorId, prefix, botId } = require('../../config.json');

module.exports = {
    name: 'help',
    aliases: ['commands'],
    category: '⚙ Utility',
    description: "List all of my commands or info about a specific command.",
    usage: `[command name]`,
    
    // Properties 
    guildOnly: false,
    cooldown: 5,
    
    execute(message,args) {
        const commandCollection = [];
        const { commands } = message.client;
        const categories = new Collection();
        const colors = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/colors.json`) );

        if (!args.length) {
            
            if (message.channel.type === 'dm') {
                return denyDM();
            }

            var serverId = message.guild.id;
            const ACL = serverId == '741904055319789620' || serverId == '758211168019415101';
            const isOwner = message.author.id == authorId;

            commands.forEach(command => {
                const category = categories.get(command.category)
                if (!command.hide && !command.acl && !command.ownerOnly) {
                    if (category) {
                        category.set(command.name, command);
                    } else {
                        categories.set(command.category, new Collection().set(command.name, command));
                    }
                }

                if (ACL) {
                    if (!command.hide && !command.ownerOnly) {
                        if (category) {
                            category.set(command.name, command);
                        } else {
                            categories.set(command.category, new Collection().set(command.name, command));
                        }
                    }
                }

                if (isOwner) {
                    if (command.ownerOnly) {
                        if (category) {
                            category.set(command.name, command);
                        } else {
                            categories.set(command.category, new Collection().set(command.name, command));
                        }
                    }
                }
            });

            const botUser = message.guild.members.cache.get(botId);
            const embed = new MessageEmbed()
                .setAuthor(`${message.guild.name} - ${botUser.user.username}`, botUser.user.avatarURL())
                .setTitle("Here's a list of all of my commands!")
                .setColor(colors.neutral)
                .setThumbnail(message.guild.iconURL({ format: 'png', size: 512 }))
                //.setThumbnail(botUser.user.avatarURL({ format: 'png', size: 512 / 2 }))
                .setDescription(`**You can send \`${prefix}help [command name]\` to get info on a specific command!**`)
                .setTimestamp()
                .setFooter(`Copyright © 2020 by Irii`, message.guild.members.cache.get('264886440771584010').user.avatarURL());

            categories.forEach((category, name) => {
                embed.addField(`${name}`, category.map(command => '⊳ ' + command.name).join("\n"), true)
            })

            return message.author.send(embed)
                .then(() => {
                    let goodReply = new MessageEmbed()
                        .setColor(colors.neutral)
                        .setDescription(`Hey <@!${message.author.id}>, I\'ve sent you a DM with all of my commands!`)

                    if (message.channel.type === 'dm') return;
                    
                    message.channel.send(goodReply);
                })
                .catch(error => {
                    let reply = new MessageEmbed()
                        .setColor(colors.negative)
                        .setDescription(`Hey <@!${message.author.id}>, it seems like I can\'t DM you! Check to make sure your DM\'s are enabled!`);

                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.channel.send(reply);
                });
        
/*

            const lines = categories.map((category, name) => `${name}: ${category.map(command => command.name)}`)
                .join("\n");*/

            /*
            data.push('Here\'s a list of all my commands:');
            data.push(commands.map(command => command.name).join(', '));
            data.push(`\n**You can send \`${prefix}help [command name]\` to get info on a specific command!**`);

            return message.author.send(lines, { split: true })
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.channel.send(`Hey <@!${message.author.id}>, I\'ve sent you a DM with all of my commands!`);
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Check to make sure your DM\'s are enabled!');
                });*/
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that\'s not a valid command!');

        }

        let embed = new MessageEmbed()
            .setTitle("**∮** `" + command.name + "`")
            .setColor(0xf5f25b);

        if (command.aliases) embed.addField("**Aliases:**", `${command.aliases.join(', ')}`);
        if (command.description) embed.addField("**Description:**", `${command.description}`);
        if (command.usage) embed.addField("**Usage:**", `${prefix}${command.name} ${command.usage}`);
        embed.addField("**Cooldown:**", `${command.cooldown || 3} second(s)\n `);
        embed.setFooter("📨" + message.author.username);
        embed.setTimestamp(Date.now());

        message.channel.send(embed);
    
        function denyDM() {
            let errorEmbed = new MessageEmbed()
                .setAuthor(`⚠ Wait!`)
                .setColor(colors.negative)
                .setDescription(`I can\'t execute that command inside DM\'s without a specified command! Please retry by adding a command from the list or call the list by using \`${prefix}help\` in any server that I reside in! (I'll send it right over to your DMs!)`)
                .addField(`For example:`, `\`${prefix}help ping\`\n\`${prefix}help mute\`\n\`${prefix}help kick\``);
            message.reply(errorEmbed);
        }
    }

}