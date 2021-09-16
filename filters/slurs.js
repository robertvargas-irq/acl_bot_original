const Discord = require('discord.js');
const fs = require('fs');

module.exports = (client) => {
    client.on('message', message => {

        // declare variables
        let blacklist = require('./blacklist.json').slursStrict;

        // filter leetspeak
        let leetFilter = {
            "i" : [/[1!|]/g, 'i'],
            "o" : [/[0]/g, 'o'],
            "a" : [/[4@]/g, 'a'],
            "e" : [/[3£₤€]/g, 'e'],
            "n" : [/(\/v|И|и|п)/g, 'n'],
            " " : [/\\/g, '']
        }

        let filteredMsg = message.content.toLowerCase();
        for ( w in leetFilter ) {
            filteredMsg = filteredMsg.replace(leetFilter[w][0], leetFilter[w][1]);
        };
        
        //
        // Strict
        //

        for ( w of blacklist ) {
            if ( ` ${filteredMsg} `.includes(` ${w} `) ) {
                let guildID = message.guild.id;
                let msg = message;
                const colors = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/colors.json`) );
                const channels = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/channels.json`) );
                
                let logEmbed = new Discord.MessageEmbed()
                    .setAuthor(`${message.author.username}`, `${message.author.avatarURL()}`)
                    .setTitle("⚠ Caught slur")
                    .setColor(colors.negative)
                    .setDescription(`**Caught term:** *${w}*\n**Original content:** *${message.content}*\n**Channel sent**: *${message.channel}*`)
                    .setTimestamp();
    
                if (channels.slurLog)
                    message.guild.channels.cache.get(channels.slurLog).send(logEmbed);
    
                message.delete();
                let warnEmbed = new Discord.MessageEmbed()
                    .setColor(colors.negative)
                    .setTitle(`${message.author.username},`)
                    .setDescription(`please refrain from using profrain slurs and offensive terminology.\n**${msg.guild.name}** has a **zero-tolerance policy** against slurs and harassment of any kind.\n\`Caught term:\` \`${w}\``)
                    .setFooter(`Please check the server rules if you have any questions. \n| This message will timeout in 10 seconds.`);
                msg.channel.send(warnEmbed)
                    .then(msg => msg.delete({timeout: 10 * 1000}))
                    .catch(e => console.log(e));
                console.log(`[slr] A slur has been caught in #${msg.channel.name}(${msg.guild.name})`);
                console.log({
                    guild: msg.guild.id,
                    author: msg.author.username,
                    authorID: msg.author.id,
                    caughtTerm: w,
                    contents: msg.content
                });
                return;
    
            } // end if
        } // end for

        //
        // Sensitive
        //

        blacklist = require('./blacklist.json').slursSensitive;
        
        for ( w of blacklist ) {
            if ( ` ${filteredMsg} `.includes(`${w}`)) {
                let guildID = message.guild.id;
                let msg = message;
                const colors = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/colors.json`) );
                const channels = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/channels.json`) );
                
                let logEmbed = new Discord.MessageEmbed()
                    .setAuthor(`${message.author.username}`, `${message.author.avatarURL()}`)
                    .setTitle("⚠ Caught slur")
                    .setColor(colors.negative)
                    .setDescription(`**Caught term:** *${w}*\n**Original content:** *${message.content}*\n**Channel sent**: *${message.channel}*`)
                    .setTimestamp();
    
                if (channels.slurLog)
                    message.guild.channels.cache.get(channels.slurLog).send(logEmbed);
    
                message.delete();
                let warnEmbed = new Discord.MessageEmbed()
                    .setColor(colors.negative)
                    .setAuthor(`${message.author.username},`)
                    .setDescription(`please refrain from using profrain slurs and offensive terminology.\n**${msg.guild.name}** has a **zero-tolerance policy** against slurs and harassment of any kind.\n\`Caught term:\` \`${w}\``)
                    .setFooter(`Please check the server rules if you have any questions. \n| This message will timeout in 10 seconds.`);
                msg.channel.send(warnEmbed)
                    .then(msg => msg.delete({timeout: 10 * 1000}))
                    .catch(e => console.log(e));
                console.log(`[slr] A slur has been caught in #${msg.channel.name}(${msg.guild.name})`);
                console.log({
                    guild: msg.guild.id,
                    author: msg.author.username,
                    authorID: msg.author.id,
                    caughtTerm: w,
                    contents: msg.content
                });
                return;
    
            } // end if
        } // end for

    });
}