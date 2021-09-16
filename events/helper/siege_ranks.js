const fs = require('fs');

module.exports = {
    async execute( button, client ) {

        let dataPath = `./servers/${button.guild.id}/data`;
        let ranksData = JSON.parse(fs.readFileSync(`${dataPath}/ranks.json`));
        
        switch( button.id ) {
            case 'button_role_clear':
                console.log(`Received request to clear rank roles.`);
                await removeRoles();
                await button.reply.send(`You have successfully removed your rank!`, true);
                break;
            default:
                console.log(`Received request to add a rank.`);
                let roleName = button.id.slice(button.id.indexOf('_') + 1).trim();
                let chosenRole = ranksData.names.indexOf(roleName);
                let roleObj = button.guild.roles.cache.get(ranksData.roleID[chosenRole]);
                console.log({
                    roleName,
                    chosenRole
                });

                await removeRoles();
                button.clicker.member.roles.add(roleObj);
                await button.reply.send(`<@${button.clicker.member.id}>, you updated your rank to **${roleName}**. *This may take a moment to reflect on your profile.*\n`, true);
                break;

        }

        return Promise.resolve('End of operation.');

        async function removeRoles() {
            ranksData.roleID.forEach(r => {
                button.clicker.member.roles.remove(r);
            });
            return Promise.resolve();
        }
    }
}