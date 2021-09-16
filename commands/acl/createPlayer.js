const config = require('../../config.json')
const user = require('../../helper/user.js');
const team = require('../../helper/team.js');
const embed = require('../../helper/embed.js');

module.exports = {
    name: 'createplayer',
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

        // parse input
        const target = message.mentions.users.first();
        const teamTarget = message.mentions.roles.first();

        // check to see if already made
        let fetchTeam = team.get( message.guild.id, teamTarget.name );
        let fetchUser = user.get( message.guild.id, target.id );

        if ( fetchTeam )
            if ( !fetchUser )
                try {
                    // create user
                    await user.create( message.guild.id, target.id, { team: teamTarget.id } )
                    let newUser = user.get( message.guild.id, target.id );
                    let userEmbed = new embed.User( newUser, target );
                    let playerEmbed = new embed.Player( newUser, target, teamTarget, false );
                    await message.channel.send( userEmbed );
                    await message.channel.send( playerEmbed );
                }
                catch (e) {
                    message.channel.send( embed.error('Something went wrong!\n`' + e + '`'))
                    throw console.log(e);
                }
            else
                return message.channel.send( embed.error('That user already exists!') );
        else
            return message.channel.send( embed.error('That team does not exist!') );
            
    }
}