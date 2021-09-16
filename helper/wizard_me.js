const { MessageEmbed, User } = require("discord.js");
const { MessageButton, MessageActionRow } = require('discord-buttons');
const write = require('./write.js');
const embedFile = require('./embed.js');
const labels = require('./labels.json');
const COLLECT_TIME = 30 * 1000;

class Me {
    constructor ( data, message, avatarURL ) {
        this.data = data;
        this.avatar = avatarURL;
        this.guild = data.guild;
        this.message = message;
        this.menu;
        this.button_filter = ( b ) => b.clicker.member.id === message.author.id;
        this.message_filter = ( m ) => m.author.id === message.author.id;
        this.buttons = createButtons( message.author.id !== process.env.AUTHORID );
        this.embed = new MessageEmbed()
            .setColor( data.color || embedFile.SUCCESS_COLOR )
            .setAuthor('🧙🏽‍♂️ Personal Wizard');
        this.embedAlt = new MessageEmbed()
            .setColor( data.color || embedFile.SUCCESS_COLOR )
            .setAuthor('🧙🏽‍♂️ Personal Wizard', avatarURL );
    }

    async done( state ) {
        switch( state ) {
            case 'time':
                let timeEmbed = new MessageEmbed( this.embed )
                    .setTitle('⏰ Time\'s up!')
                this.menu.edit({
                    components: null,
                    embed: timeEmbed
                });
                break;
            
            case 'write':
                let saveEmbed = new MessageEmbed( this.embed )
                    .setTitle('✅ All your changes have been saved!');
                this.menu.edit({
                    components: null,
                    embed: saveEmbed
                });
                break;
        }
    }

    async main() {

        let mainEmbed = new MessageEmbed( this.embed )
            .setThumbnail( this.avatar )
            .setTitle('♦ Main Menu');

        let row1 = new MessageActionRow()
            .addComponents([ this.buttons.profile, this.buttons.ubisoft ]);

        let row2 = new MessageActionRow()
            .addComponent( this.buttons.close );

        let content = {
            content: labels.beta,
            components: [ row1, row2 ],
            embed: mainEmbed
        };

        // send menu
        if ( !this.menu )
            this.menu = await this.message.channel.send( content );
        else
            this.menu.edit( content );

        // await button press
        await this.menu.awaitButtons( this.button_filter, { max: 1, time: COLLECT_TIME, errors: ['time'] } )
        .then( collected => {

            // parse first
            let b = collected.first();
            b.defer();
            switch( b.id ) {
                case 'me_profile':
                    return this.profile();
                case 'me_ubisoft':
                    return this.ubisoft();
                case 'me_close':
                    return this.menu.delete();
            }
        })
        .catch(e => {
            this.done('time');
        });

    } // end main

    async ubisoft() {

        let ubisoftMenu = new MessageEmbed( this.embedAlt )
            .setTitle('Ubisoft Account')
            .addFields(
                { name: 'Current Account on File', value: '> `' + ( this.data.ubisoft || 'No Ubisoft account on file.' ) + '`' }
            );

        // edit menu
        this.menu.edit({
            // components: null,
            buttons: [ this.buttons.change, this.buttons.back ],
            embed: ubisoftMenu
        });

        // await button press
        await this.menu.awaitButtons( this.button_filter, { max: 1, time: COLLECT_TIME, errors: ['time'] } )
        .then( collected => {

            // parse first
            let b = collected.first();
            b.defer();
            switch( b.id ) {
                case 'me_back':
                    return this.main();
                case 'me_change':
                    return this.changeUbisoft();
            }
        })
        .catch(e => {
            this.done('time');
        });

    }

    // change ubisoft name on file
    async changeUbisoft() {
        
        let changeMenu = new MessageEmbed( this.embedAlt )
            .setTitle('Declare New Ubisoft Account')
            .setDescription('> Please send the new username you wish to store.')
            .addFields(
                { name: 'Old Ubisoft Account', value: '> `' + ( this.data.ubisoft || 'NONE' ) + '`', inline: true }
            );

        this.menu.edit({
            buttons: [ this.buttons.back ],
            embed: changeMenu
        });

        let buttonCollect = this.menu.createButtonCollector( this.button_filter, { max: 1 })
        let messageCollect = this.message.channel.createMessageCollector( this.message_filter, { max: 1, time: COLLECT_TIME, errors: ['time'] });

        buttonCollect.on('collect', collected => {
            collected.defer();
            messageCollect.stop();
            return this.main();
        });

        messageCollect.on('collect', async collected => {
            let newData = collected.content;
            collected.delete();

            // change ubisoft account to new value
            this.data.ubisoft = newData;
            
            // write to file
            try {
                await write.writeJSON( this.data, `./servers/${this.message.guild.id}/users/${this.message.author.id}.json`);
            }
            catch( e ) {
                this.menu.edit({
                    components: null,
                    embed: embedFile.error('Something went wrong!\n`' + e + '`' )
                });
                throw console.log(e);
            }

            // return success
            let successEmbed = new MessageEmbed( this.embed )
                .setTitle('✅ Success!')
                .setDescription('Your Ubisoft account has been changed to `' + this.data.ubisoft + '`');
            this.menu.edit({
                components: null,
                embed: successEmbed
            });
        });

        messageCollect.on('end', collected => {
            console.log('This message collector collected ' + collected.size + ' items.');
            buttonCollect.stop();
        });
    }

}

function createButtons( testing ) {
    let close = new MessageButton()
        .setStyle('gray')
        // .setEmoji('')
        .setLabel('Close')
        .setID('me_close');

    let back = new MessageButton()
        .setStyle('gray')
        .setEmoji('↩')
        .setLabel('Back')
        .setID('me_back');

    let edit = new MessageButton()
        .setStyle('blurple')
        .setEmoji('💾')
        .setLabel('Edit')
        .setID('me_edit');

    let change = new MessageButton()
        .setStyle('blurple')
        .setEmoji('🔄')
        .setLabel('Change')
        .setID('me_change');

    let profile = new MessageButton()
        .setStyle('blurple')
        .setEmoji('📝')
        .setLabel('Profile')
        .setID('me_profile')
        .setDisabled( true );

    let ubisoft = new MessageButton()
        .setStyle('blurple')
        .setEmoji('🔘')
        .setLabel('Ubisoft Account')
        .setID('me_ubisoft');

    return { close, back, edit, change, profile, ubisoft };
}

module.exports = { Me };