const { MessageEmbed } = require("discord.js");
const fs = require('fs');
const config = require('../../config.json')
const user = require('../../helper/user.js');
const team = require('../../helper/team.js');
const embed = require('../../helper/embed.js');
const { Team } = require('../../helper/embed.js');

module.exports = {
    name: 'team',
    aliases: ['t', 'tm'],
    category: '📑 Custom Profiles',
    description: "Load up a teams's custom profile! Complete with their mission statement and bio!",
    usage: '<team name or @ping>',
    
    // Properties 
    guildOnly: true,
    args: true,
    cooldown: false,
    acl: true,

    async execute( message, args ) {

        // declare variables
        let teamNameQuery = args.join(' ').toLowerCase();
        let query;
        let menu;

        // parse search and get teamInfo.json
        if ( message.mentions.roles.first() )
            query = message.mentions.roles.first();
        else
            query = await message.guild.roles.cache.find(r => r.name.toLowerCase().startsWith( teamNameQuery ))
                || await message.guild.roles.cache.find(r => r.name.toLowerCase().includes( teamNameQuery ));

        if ( !query )
            return message.channel.send( embed.error('No team found!') );

        let teamInfo = await team.get( message.guild.id, query.name );
        
        // validate data
        if ( Array.isArray( teamInfo ) )
            return message.channel.send( embed.error('More than one team found!\n' + teamInfo.join('\n')) );
        else if ( !teamInfo )
            return message.channel.send( new MessageEmbed()
                .setColor( embed.ERROR_COLOR )
                .setTitle( '❗' + query.name + ' does not have a custom team profile on file!')
                .setDescription('>>> *Currently, personalized team profiles are only available for a select few teams, but as testing continues it will be rolled out to many more across the server!*')
            );

        // display team info
        menu = new Team( teamInfo, query );
        message.channel.send( menu.display() );
        return;

    }
}