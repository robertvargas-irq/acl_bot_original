const { MessageEmbed } = require("discord.js");
const { Me } = require('../../helper/wizard_me.js');
const user = require('../../helper/user.js');
const embed = require('../../helper/embed.js');

module.exports = {
    name: 'me',
    aliases: ['m'],
    category: '📑 Custom Profiles',
    description: "Load up your personalization wizard!",
    usage: false,
    
    // Properties 
    guildOnly: true,
    args: false,
    cooldown: 10,
    acl: true,

    async execute( message, args ) {
        message.delete();

        // TODO: implement check for profile once public

        // fetch data
        const data = await user.get( message.guild.id, message.author.id );
        if ( !data ) {
            return message.channel.send( new MessageEmbed()
                .setColor( embed.ERROR_COLOR )
                .setTitle( '❗' + userQuery.tag + ' does not have a custom player profile on file!' )
                .setDescription('>>> *Currently, player profiles are only available for a select few teams and their players, but as testing continues it will be rolled out to many more across the server!*')
            );
        }

        console.log('> ' + message.author.username + ' has opened their menu!');
        console.log({
            guildID: message.guild.id,
            userID: message.author.id,
            isPlayer: data.team
        });

        // initiate wizard
        const wizard = new Me( data, message, message.author.avatarURL() );
        return wizard.main();

    }
}