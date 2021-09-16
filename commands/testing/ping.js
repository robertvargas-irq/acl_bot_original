const { MessageEmbed } = require("discord.js");
const config = require('../../config.json')

module.exports = {
    name: 'ping',
    aliases: false,
    category: '⚙ Utility',
    description: "This is a simple ping command.",
    usage: false,
    
    // Properties 
    guildOnly: true,
    args: false,
    cooldown: 5,

    execute(message,args) {
        if (!args[0]) return message.channel.send(':owl:').then(message.delete());

        let embed = new MessageEmbed().setColor(0xf5f25b);
        if (args[0] && message.member.permissions.has('ADMINISTRATOR'))
            switch (args[0]) {
                case 'hello':
                    embed
                        .setTitle("👋 Hey there everyone! I'm **Ascension Owl**, it's a pleasure to meet you all!")
                        .setDescription("So far the benefit of my existence goes to moderators and both Team Staff and Team Rep members to add their teammates over at <#762880653372424212>, but more commands are currently in development for both fun and practical uses!\nJust give my creator a cup of coffee and it should be smooth sailing from here! ☕")
                        .setFooter(`My prefix on this server is ${config.prefix} * Version: ${config.version}`);
                    message.channel.send(embed);
                    break;
                
                case 'vibes':
                    message.channel.send("I vibe p hard");
                    break;

                case 'puppies':
                    embed
                        .setTitle("Hey there!")
                        .setDescription("Here\'s something to brighten up your day! Have some [adorable puppies](https://rb.gy/kxztvh)!")
                        .setFooter("✨ ~ Random uplifting messages [Day 1]")
                        .setTimestamp();

                    message.channel.send(embed);
                    break;
                
            }
        
        message.delete();
        return;
    
    }
}