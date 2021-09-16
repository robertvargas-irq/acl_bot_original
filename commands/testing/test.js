const { MessageEmbed } = require("discord.js");
const fs = require('fs');
const config = require('../../config.json')
const user = require('../../helper/user.js');
const team = require('../../helper/team.js');
const embed = require('../../helper/embed.js');
const { Team, User, Player } = require('../../helper/embed.js');

module.exports = {
    name: 'test',
    aliases: false,
    category: 'OWNER',
    description: "For Team Staff or Team Reps to add or remove members from their team roster.",
    usage: '<add|remove> <@user> <@team>',
    
    // Properties 
    guildOnly: true,
    args: false,
    cooldown: 7,
    acl: true,
    ownerOnly: true,

    async execute( message, args ) {
        if ( message.author.id !== config.authorId && message.guild.id !== '758211168019415101' ) return;
        
    }
}