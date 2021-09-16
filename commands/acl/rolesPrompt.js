const { MessageEmbed, MessageAttachment } = require('discord.js');
const { MessageButton, MessageActionRow } = require('discord-buttons');
const config = require('../../config.json');
const fs = require('fs');

module.exports = {
    name: 'prompt',
    aliases: false,
    category: '🦉 Ascension League',
    description: "For Team Staff or Team Reps to add or remove members from their team roster.",
    usage: 'TESTING',

    // Properties 
    guildOnly: true,
    args: false,
    cooldown: 7,
    acl: false,
    ownerOnly: true,

    execute(message, args, client) {

        if (message.author.id !== config.authorId)
            return message.channel.send('Not the author!');

        let dataPath = `./servers/${message.guild.id}/data`;
        switch ( args.join(' ').trim() ) {
            case 'ranks':
                ranks();
                message.delete();
                break; // from RANKS
            case 'notifications':
                notifications();
                message.delete();
                break;

        } // end switch statement
        return;

        /*
         * functions
        */

        function ranks(){
            let ranksEmbed = new MessageEmbed()
                .setColor( JSON.parse( fs.readFileSync(`${dataPath}/colors.json`) ).neutral )
                .setTitle("🧧 Declare your hard-earned rank below")
                //.setDescription('Show off your in-game rank by setting it up below!')
                .setImage(`https://drive.google.com/uc?export=view&id=1RsjGqZOmL6Igxv4DpXCIdK7Z7oSPHIkn`);

            let ranksRow = new MessageActionRow();
            let ranksData = JSON.parse( fs.readFileSync(`${dataPath}/ranks.json`) );

            let deleteAll = new MessageButton()
                .setStyle('red')
                .setEmoji('🗑')
                .setID('button_role_clear');
            let optionRow = new MessageActionRow()
                .addComponent(deleteAll);

            for ( let i in ranksData.names ) {
                console.log(i);
                let buttonTemp = new MessageButton()
                    .setStyle('blurple')
                    .setEmoji(ranksData.emojiID[i])
                    .setLabel(`${ranksData.names[i]} [${ranksData.mmr[i]}]`)
                    .setID(`button_${ranksData.names[i]}`);

                console.log(JSON.stringify(buttonTemp));
                if ( ranksData.names[i] !== 'Bronze' && ranksData.names[i] !== 'Copper' )
                    ranksRow.addComponent(buttonTemp);
                else
                    optionRow.addComponent(buttonTemp);
            }
            
            message.channel.send({
                components: [ ranksRow, optionRow ],
                embed: ranksEmbed
            });
        } // end notifications

        function notifications() {
            let notificationEmbed = new MessageEmbed()
                .setColor( JSON.parse( fs.readFileSync(`${dataPath}/colors.json`) ).neutral )
                .setTitle("🧧 Which notifications would you like to receive?")
                .setDescription('')
                .setImage(`https://drive.google.com/uc?export=view&id=1Au_cfYC-L6THc4AMlywmS8o7SFT1P-_X`);

                let notifRow = new MessageActionRow();
                let notifData = JSON.parse( fs.readFileSync(`${dataPath}/notifications.json`) );

                for ( let i in notifData.names ) {
                    if ( i > 4 )
                        break;

                    console.log(i);
                    let buttonTemp = new MessageButton()
                        .setStyle('blurple')
                        .setEmoji(notifData.emojiID[i])
                        .setLabel(`${notifData.names[i]}`)
                        .setID(`button_${notifData.names[i]}`);

                    console.log(JSON.stringify(buttonTemp));
                    
                }

            
        } // end notifications
    }
}