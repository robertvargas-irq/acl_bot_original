const { MessageEmbed } = require("discord.js");
const config = require('../../config.json')
const fs = require('fs');
const team = require('../../helper/team.js');
const embed = require('../../helper/embed.js');

module.exports = {
    name: 'createteam',
    aliases: false,
    category: '🦉 Ascension League',
    description: "For Team Staff or Team Reps to add or remove members from their team roster.",
    usage: '',
    
    // Properties 
    guildOnly: true,
    args: true,
    cooldown: 7,
    acl: true,
    ownerOnly: true,

    async execute( message, args ) {
        if ( message.author.id !== config.authorId && message.guild.id !== '758211168019415101' ) return;

        // fetch data
        const roles = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/roles.json`) );
        const colors = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/colors.json`) );
        const channels = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/channels.json`) );
        const fetchRole = (id) => message.guild.roles.cache.get(id);

        const target = message.mentions.roles.first();

        // check to see if already made
        let fetch = team.get( message.guild.id, target.name );
        if ( fetch )
            return message.channel.send( embed.error('That team already exists!') );
        else
            try {
                let newTeam = await team.create( message.guild.id, { teamName: target.name, teamID: target.id } );
                let teamEmbed = new embed.Team( newTeam, target );
                message.channel.send( teamEmbed.display() );
            }
            catch (e) {
                message.channel.send( embed.error('Something went wrong!\n' + e ) );
            }
            
    }
}