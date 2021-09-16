var buttonPresses = 0;
const RANKS = ['button_role_clear', 'button_Copper', 'button_Bronze', 'button_Silver', 'button_Gold', 'button_Platinum', 'button_Diamond', 'button_Champion'];
const NOTIFS = ['button_'];

module.exports = async (client) => {
    client.on('clickButton', async (button) => {

        let helperName = false;

        if ( RANKS.some( a => a === button.id ) )
            helperName = 'siege_ranks';
        
        if ( helperName )
            require(`./helper/${helperName}`).execute(button, client)
                .then(r => {
                    console.log(r);
                    console.log(`Button Click #${buttonPresses}`);
                })
                .catch(e => {
                    console.log(e);
                    console.log(`Button Click #${buttonPresses}`);
                });
        else
            return;

        // log presses
        console.log(`${button.clicker.user.tag} has clicked a global button!`);
        console.log({
            buttonID: button.id,
            userID: button.clicker.member.id,
            guildID: button.guild.name
        });
        buttonPresses++;

    });
}