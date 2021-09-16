const { botId } = require('../config.json');

module.exports = async (client) => {
    client.on('message', message => {

        // filter out the bot
        if ( message.author.id == botId )
        return;
        
        let list = require('./keywords.json');
        for ( a in list )
            for ( w in list[a] )
                if ( (` ${message.content.toLowerCase()} `).includes(` ${w} `))
                    return message.channel.send(list.memes[w]);

    }); // end event
}