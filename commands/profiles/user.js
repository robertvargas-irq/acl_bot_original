const { MessageEmbed } = require("discord.js");
const fs = require('fs');
const config = require('../../config.json')
const user = require('../../helper/user.js');
const team = require('../../helper/team.js');
const embed = require('../../helper/embed.js');
const { User } = require('../../helper/embed.js');

module.exports = {
    name: 'user',
    aliases: ['u'],
    category: '📑 Custom Profiles',
    description: "Load up a user's custom profile! Complete with their favorite operators and Siege stats!",
    usage: '<username or @ping>',
    
    // Properties 
    guildOnly: true,
    args: false,
    cooldown: false,
    acl: true,

    async execute( message, args ) {
        message.delete();

        // declare variables
        let userInput = args.join(' ').toLowerCase();
        let userQuery;
        let teamQuery;
        let menu;

        // parse user search and get Discord.User object
        if ( args.length > 0 )
            userQuery = message.mentions.users.first() ? message.mentions.users.first() :
            message.client.users.cache.find( u => u.username.toLowerCase().startsWith( userInput ) )
            || message.client.users.cache.find( u => u.username.toLowerCase().includes( userInput ) );
        else
            userQuery = message.author;
        
        if ( !userQuery )
            return message.channel.send( embed.error('No player found!') );
        
        // retrieve playerInfo.json
        let userInfo = await user.get( message.guild.id, userQuery.id );
        
        // validate data
        if ( Array.isArray( userInfo ) )
            return message.channel.send( embed.error('More than one user found!\n' + userInfo.join('\n')) );
        else if ( !userInfo )
            return message.channel.send( new MessageEmbed()
                .setColor( embed.ERROR_COLOR )
                .setTitle( '❗' + userQuery.tag + ' does not have a custom user profile on file!')
                .setDescription('>>> *Currently, user profiles are only available for a select few teams and their players, but as testing continues it will be rolled out to many more across the server!*')
            );
        
        // search for team's Discord.Role object
        teamQuery = message.guild.roles.cache.find( r => r.id === userInfo.team );
        if ( teamQuery )
            userInfo.team = {
                name: teamQuery.name,
                emoji: JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/teams/${teamQuery.name}/teamInfo.json`) ).emojiID
            };
        else
            userInfo.team = {};

        // prompt pre-loader
        // let loadingMsg = await message.channel.send( new MessageEmbed()
        //     .setThumbnail( process.env.PRELOADER )
        //     .setColor( embed.SUCCESS_COLOR )
        //     .setTitle('Loading player profile...')
        // );

        // display user info
        menu = new User( userInfo, userQuery );
        await message.channel.send( menu.display() );
        // loadingMsg.delete();

    }
}