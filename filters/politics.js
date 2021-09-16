const Discord = require('discord.js');
const fs = require('fs');

module.exports = (client) => {
    client.on('message', message => {

        // check for illegal terms
        let blacklist = require('./blacklist.json').politics;
        
        var foundWord;
        if(
            (blacklist.some(w =>` ${message.content.toLowerCase()} `.includes(`${w}`)))
                || blacklist.some(w => ` ${message.content.toLowerCase()} `.includes(`${w.replace(/i/g, "|")}`)) ) {
            blacklist.some(w => {
                if (` ${message.content.toLowerCase()} `.includes(`${w}`)) foundWord = w;
            });
            console.log(foundWord);
            let guildID = message.guild.id;
            let msg = message;
            const colors = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/colors.json`) );
            const channels = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/channels.json`) );
            
            let logEmbed = new Discord.MessageEmbed()
                .setAuthor(`${message.author.username}`, `${message.author.avatarURL()}`)
                .setTitle("⚠ Caught banned term")
                .setColor(colors.negative)
                .setDescription(`**Caught term:** *${foundWord}*\n**Original content:** *${message.content}*\n**Channel sent**: *${message.channel}*`)
                .setTimestamp();

            if (channels.slurLog)
                message.guild.channels.cache.get(channels.slurLog).send(logEmbed);

            if (!message.member.permissions.has('ADMINISTRATOR')) {
                message.delete();
                let warnEmbed = new Discord.MessageEmbed()
                    .setColor(colors.negative)
                    .setDescription(`Due to the current political climate, certain terms have been blacklisted from being sent in the server. We apologize for the inconvenience, and we thank you for your understanding.\n\`Caught term:\` \`${foundWord}\``)
                    .setFooter(`Please check the server rules if you have any questions. \n| This message will timeout in 10 seconds.`);
                msg.channel.send(warnEmbed)
                    .then(msg => msg.delete({timeout: 10 * 1000}))
                    .catch();
            } else {
                message.react('⚠')
                    .then(message.react('🗯'));
                let warnEmbed = new Discord.MessageEmbed()
                    .setColor(colors.negative)
                    .setDescription(`Due to the current political climate, certain terms have been blacklisted from being sent in the server. However, Administrational Officers are exempt in order to detail the type of language that is not permitted.\n\`Caught term:\` \`${foundWord}\``)
                    .setFooter(`Please check the server rules if you have any questions. \n| This message will timeout in 10 seconds.`);
                msg.channel.send(warnEmbed)
                    .then(msg => msg.delete({timeout: 10 * 1000}))
                    .catch();

            }
            console.log(`[slr] A banned statement has been caught in #${msg.channel.name}(${msg.guild.name}) from ${msg.author.username}\n[---] Contents: ${msg.content}`);
            return;
        }
    });
}