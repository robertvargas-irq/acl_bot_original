const { GuildMember, MessageEmbed } = require("discord.js");
const fs = require('fs');
const config = require('../../config.json')

module.exports = {
    name: 'purge',
    aliases: false,
    category: '🔰 Moderator',
    description: "Kicks a user from the server.",
    usage: '<number of messages>',
    
    // Properties 
    guildOnly: true,
    args: true,
    cooldown: 10,

    async execute(message, args) {
        
        const colors = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/colors.json`) );
        let embed = new MessageEmbed().setColor(colors.neutral);

        const isAdmin = message.member.permissions.has('MANAGE_MESSAGES');

        // check if no args
        if (!args[0]) {
            embed
                .setColor(colors.negative)
                .setDescription('Please provide a specific number of messages to delete!')
                .setFooter('Remember, you can only delete messages up to 2 weeks old!');
            message.channel.send(embed);
            return;
        }

        // check for kosha
        if (message.author.id == '307322179421339649')
            if (args[0] > 5)
                return deny("Due to possible abuse reasons, you cannot delete more than 5 messages at a time.");
        
        // execute purge command
        if (isAdmin) {
            if (args[0] <= 100) {
                await message.delete();
                message.channel.bulkDelete(args[0]);
                console.log(`[cmd] ${message.author.username} has deleted ${args[0]} message(s) in #${message.channel.name}(${message.guild.name})`);
                return;
            } else return deny("You can only delete a max of 100 messages!");
        } else return deny("You do not have authorization to use that command!")
    
        function deny(reason) {
            embed.setDescription("**⌠≙ERROR⌡≫** " + reason);
            message.channel.send(embed)
                .then(msg => {
                    msg.delete({timeout: 8000})
                });
            message.react('⚠');
            message.delete({timeout: 8000});

            console.log(`[den] ${message.author.username} has been denied the ${args[0]} command due to: ${reason}`)
            return;
        }

    }
}