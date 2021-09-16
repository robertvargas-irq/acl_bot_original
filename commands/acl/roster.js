const { MessageEmbed } = require("discord.js");
const config = require('../../config.json')
const fs = require('fs');

module.exports = {
    name: 'roster',
    aliases: false,
    category: '🦉 Ascension League',
    description: "For Team Staff or Team Reps to add or remove members from their team roster.",
    usage: '<add|remove> <@user> <@team>',
    
    // Properties 
    guildOnly: true,
    args: true,
    cooldown: 7,
    acl: true,

    execute(message,args) {

        // fetch data
        const roles = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/roles.json`) );
        const colors = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/colors.json`) );
        const channels = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/channels.json`) );
        const fetchRole = (id) => message.guild.roles.cache.get(id);

        // construct embed
        const embed = new MessageEmbed().setColor(colors.neutral);

        // only ACL
        const isACL = message.guild.id == '741904055319789620' || '758211168019415101';
            if (!isACL) return deny("This command can only be used within Ascension League.");

        

        // check if listing & cache roles
        const isListing = args[0] == 'list';
            if (isListing)
                return message.channel.send("The `LIST` property has been deprecated.");

        // FIXME: POSSIBLE REMOVAL
        // Staff Roles
        const teamStaffRole = fetchRole(roles.team.staff);
        const teamCaptainRole = fetchRole(roles.team.captain);

        // check for correct arguments
        var teamRole = message.mentions.roles.first();
            if (!teamRole) return deny("No team role was provided!");
        var targets = message.mentions.members.array();
        if ( targets.length > 8 )
            return deny('You cannot add more than 8 users at a time!');

        // check permissions
        const hasPermissions = message.member.permissions.has('MANAGE_ROLES');

        // allocate role positions
        const listPL = message.guild.roles.cache.find(role => role.name === "//PL");
        const listCL = message.guild.roles.cache.find(role => role.name === "//CL");
        const listQL = message.guild.roles.cache.find(role => role.name === "//QF");
        const endRoles = message.guild.roles.cache.find(role => role.name === "//END TEAMS");

        // check the type of team
        const isPL = (teamRole.position < listPL.position) && (teamRole.position > listCL.position);
        const isCL = (teamRole.position < listCL.position) && (teamRole.position > listQL.position);
        const isQL = (teamRole.position < listQL.position) && (teamRole.position > endRoles.position);

        // declare PL and CL roles
        const PLRole = fetchRole(roles.league.PL);
        const CLRole = fetchRole(roles.league.CL);
        const QLRole = fetchRole(roles.league.QF);
        
        // check to see if they already have either role
        for ( let i in targets ) {
            if ( ( targets[i].roles.cache.has(PLRole.id) || targets[i].roles.cache.has(CLRole.id) || targets[i].roles.cache.has(QLRole.id) ) && args[0] != 'remove' )
                targets.splice( i, 1 );
        }
        if ( targets.length < 1 )
            return deny('It seems like the users you tried to add are already on a team!');

        // terms
        const isCorrectChannel = (message.channel.id == channels.roster) || hasPermissions;
        const isValidTeam = !( (teamRole.position <= endRoles.position) || (teamRole.position >= teamStaffRole.position) );
        const givingStaff = teamRole.equals(teamStaffRole) || teamRole.equals(teamCaptainRole);

        /*
         * give error
        */

        if (givingStaff && !hasPermissions) return deny("You cannot give or take away a team staff role!");
        if ( targets.some( t => message.author.id == t.id ) )
            return deny("You cannot add or remove yourself from a team!");

        if (isCorrectChannel) {
            if (isValidTeam) {
                if (message.member.roles.cache.has(teamRole.id) || hasPermissions) {
                    switch (args[0]) {
                        case 'add':
                            for ( let i in targets ) {
                                targets[i].roles.add(teamRole);
                                addLeagueBracket(targets[i]);
                            }
                            embed
                                .setColor(colors.rosterAdd)
                                .addFields(
                                    { name: 'Caller', value: `${message.author.username} (<@${message.author.id}>)`, inline: true },
                                    { name: 'Team', value: teamRole.name, inline: true },
                                    { name: 'Added users', value: targets.map(t => `<@${t.id}>`).join('\n'), inline: true }
                                );
                            break;
                        
                        case 'remove':
                            for ( let i in targets ) {
                                targets[i].roles.remove(teamRole);
                                targets[i].roles.remove(teamStaffRole);
                                targets[i].roles.remove(teamCaptainRole);
                                removeLeagueBracket(targets[i]);
                            }
                            embed
                                .setColor(colors.rosterRemove)
                                .addFields(
                                    { name: 'Caller', value: `${message.author.username} (<@${message.author.id}>)`, inline: true },
                                    { name: 'Team', value: teamRole.name, inline: true },
                                    { name: 'Removed users', value: targets.map(t => `<@${t.id}>`).join('\n'), inline: true }
                                );
                            break;
                        
                        case 'staff':
                            return deny('`STAFF` ADDITION IS CURRENTLY BROKEN')

                            if (!hasPermissions) deny("You are not authorized to do that. Please contact an Administrational Officer if you believe this was a mistake");
                            embed.setDescription(`✅ <@${target.id}> has been added to ${teamRole.name}'s staff team.`)
                            target.roles.add(teamStaffRole);
                            target.roles.remove(teamCaptainRole);
                            target.roles.add(teamRole);
                            addLeagueBracket();
                            return successAdmin();

                        case 'captain':
                            return deny('`CAPTAIN` ADDITION IS CURRENTLY BROKEN')

                            embed.setDescription(`✅ <@${target.id}> has been assigned as ${teamRole.name}'s captain.`);
                            target.roles.add(teamCaptainRole);
                            target.roles.remove(teamStaffRole);
                            target.roles.add(teamRole);
                            addLeagueBracket();
                            return successAdmin();

                        case 'demote':
                            return deny('`DEMOTE` FUNCTION IS CURRENTLY BROKEN')

                            embed.setDescription(`✅ <@${target.id}> has been removed from ${teamRole.name}'s administrative team.`);
                            target.roles.remove(teamStaffRole);
                            target.roles.remove(teamCaptainRole);
                            removeLeagueBracket();
                            return successAdmin();
                        
                        default:
                            return deny(args[0] + " is not a valid argument!\n---Anyone:{list}\n--Team Members:{add, remove}\n-Admin/Mods:{staff, captain, demote}")

                    }

                    return success();

                } else deny("You are not part of that team!");
            } else deny("This is not a valid team!");
        } else deny("This is not the correct channel for your query!");

        return;

        /* 
         * functions
        */

        // error message
        function deny(reason) {
            embed
                .setColor(colors.negative)
                .setDescription("**⌠≙ERROR⌡≫** " + reason);
            message.channel.send(embed)
                .then(msg => {
                    msg.delete({timeout: 8000})
                });
            message.react('⚠');
            message.delete({timeout: 8000});

            console.log(`[den] ${message.author.username} has been denied the ${args[0]} command due to: ${reason}`)
            return;
        }

        // add respective league bracket
        function addLeagueBracket(current) {
            if (isPL)
                return current.roles.add(PLRole);
            if (isCL)
                return current.roles.add(CLRole);
            if (isQL)
                return current.roles.add(QLRole);
        }
        
        // remove respective league bracket
        function removeLeagueBracket(current) {
            current.roles.remove(PLRole);
            current.roles.remove(CLRole);
        }

        // ping success for an admin command
        function successAdmin() {
            embed
                .setTitle('**⌠≙ SUCCESS⌡**')
                .setFooter(`Administrator: ${message.author.username}\nNeed to add or remove another? ${config.prefix}roster add/remove @user @team\n`)
                .setTimestamp();

            message.channel.send(embed);
            message.delete({timeout: 60 * 1000});
            message.react('👍');

            console.log(`[cmd] ${message.author.username}'s request to ${args[0]} ${target.user.username} to ${teamRole.name} was successful.`);

            return;
        }

        // ping success for a staff command
        function success() {
            embed
                .setTitle('» Success.')
                .addFields(
                    { name: 'Important', value: 'If this is a roster change, please remember that the player add cannot play for 24 hours. Check our rulebook [here](https://discord.com/channels/741904055319789620/759841406444371978) for more information!' }
                )
                .setFooter(`Did you know? You can add up to 8 people at a time!`)
                .setTimestamp();
            
            message.channel.send(embed);
            message.delete({timeout: 60 * 1000});
            message.react('👍');

            console.log(`[cmd] ${message.author.username}'s request to ${args[0]} was successful.`)
            console.log(`[   ] Affected users:\n${targets.map(t => t.user.tag).join('\n')}`);
            return;
        }

    }
}