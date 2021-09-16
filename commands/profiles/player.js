const { MessageEmbed } = require("discord.js");
const fs = require('fs');
const config = require('../../config.json')
const user = require('../../helper/user.js');
const team = require('../../helper/team.js');
const embed = require('../../helper/embed.js');
const { Player } = require('../../helper/embed.js');

module.exports = {
    name: 'player',
    aliases: ['p'],
    category: '📑 Custom Profiles',
    description: "Load up a player's custom profile! Complete with their favorite operators and Siege stats!",
    usage: '<username or @ping>',
    
    // Properties 
    guildOnly: true,
    args: false,
    cooldown: 10,
    acl: true,

    async execute( message, args ) {
        // message.delete();

        // declare variables
        let userInput = args.join(' ').toLowerCase();
        let userQuery;
        let teamQuery;
        let season;
        let menu;

        // parse season search
        if ( userInput.includes(',') ) {
            season = userInput.slice( userInput.indexOf(',') + 1 ).trim();
            userInput = userInput.substring( 0, userInput.indexOf(',') ).trim();
            console.log({
                userInput: userInput,
                season : season
            });
        }
        else
            season = false;

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
        let playerInfo = await user.get( message.guild.id, userQuery.id );
        
        // validate data
        if ( Array.isArray( playerInfo ) )
            return message.channel.send( embed.error('More than one player found!\n' + playerInfo.join('\n')) );
        else if ( !playerInfo )
            return message.channel.send( new MessageEmbed()
                .setColor( embed.ERROR_COLOR )
                .setTitle( '❗' + userQuery.tag + ' does not have a custom player profile on file!')
                .setDescription('>>> *Currently, player profiles are only available for a select few teams and their players, but as testing continues it will be rolled out to many more across the server!*')
            );
        
        // search for team's Discord.Role object
        teamQuery = message.guild.roles.cache.find( r => r.id === playerInfo.team );
        if ( !teamQuery )
            return message.channel.send( embed.error('This user is not on a team! This feature is currently available only to players currently competing within Ascension League.' ) );

        // prompt pre-loader
        let loadingMsg = await message.channel.send( new MessageEmbed()
            .setThumbnail( process.env.PRELOADER )
            .setColor( embed.SUCCESS_COLOR )
            .setTitle('Loading player profile...')
        );

        // display user info
        menu = new Player( playerInfo, userQuery, teamQuery, season );
        try {
            await message.channel.send( await menu.display() );
            loadingMsg.delete();
        }
        catch (e) {
            loadingMsg.edit({
                embed: embed.error('Unable to load player stats!\n' + '`' + e + '`')
            });
        }

    }
}