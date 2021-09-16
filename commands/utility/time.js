const { GuildMember, MessageEmbed } = require("discord.js");
const config = require('../../config.json')

module.exports = {
    name: 'time',
    aliases: false,
    category: '⚙ Utility',
    description: "Converts an Eastern Time input to your current time zone",
    usage: '<time (hour)>',
    
    // Properties 
    guildOnly: true,
    args: true,
    cooldown: 1,

    execute(message,args) {
        const timeNow = Date.now();
        const givenTime = args[0];
        var hours = parseInt(args[0]);
        var GMT, ET, CT, MT, PT;

        // check for minutes
        if (givenTime.indexOf(':'))
            var minutes = givenTime.slice(givenTime.indexOf(':') + 1);
        if (givenTime.indexOf(':') == -1)
            return message.channel.send("**INCORRECT INPUT!** hours:minutes(optional am/pm)");

        // handle 12 hour time
        const is12hr = givenTime.indexOf('am') > -1 || givenTime.indexOf('pm') > -1
        if (is12hr) {
            hours += 12;
            var timeCode = minutes.slice(minutes.indexOf('am') - 1 || minutes.indexOf('pm') - 1);
            minutes = minutes.slice(0, (minutes.indexOf('am') - 1) || (minutes.indexOf('pm') - 1));
        }
        if (givenTime.indexOf('pm') > -1)
            GMT += 12;
                
        GMT = hours + 5;
        ET = hours;
        CT = hours - 1;
        MT = hours - 2;
        PT = hours - 3;

        // offset 24 hour time
        if (GMT > 23) GMT -= 24;
        if (GMT < 0) GMT += 24;
            if (GMT < 10) GMT = `0${GMT}`;
        
        if (is12hr) ET -= 12;
            if (ET > 23) ET -= 24;
            if (ET < 0) ET += (is12hr ? 12 : 24);
                if(!is12hr && ET < 10) ET = `0${ET}`;
        
        if (is12hr) CT -= 12;
            if (CT > 23) CT -= 24;
            if (CT < 0) CT += (is12hr ? 12 : 24);
                if(!is12hr && CT < 10) CT = `0${CT}`;
        
        if (is12hr) MT -= 12;
            if (MT > 23) MT -= 24;
            if (MT < 0) MT += (is12hr ? 12 : 24);
                if (!is12hr && MT < 10) MT = `0${MT}`;

        
        if (is12hr) PT -= 12;
            if (PT > 23) PT -= 24;
            if (PT < 0) PT += (is12hr ? 12 : 24);
                if (!is12hr && PT < 10) PT = `0${PT}`;


        console.log(GMT + " " + ET + " " + CT + " " + MT + " " + PT);

        const embed = new MessageEmbed()
            .setTitle(`Inital Conversion of Time: ${givenTime} ` + (is12hr ? `(12 hour)` : `(24 hour)`))
            .setColor(0xf5f25b)
            .addField(`GMT`, `${GMT}:${minutes}`)
            .addField(`ET`, `${ET}:${minutes}` + (is12hr ? `${timeCode}` : ``))
            .addField(`CT`, `${CT}:${minutes}` + (is12hr ? `${timeCode}` : ``))
            .addField(`MT`, `${MT}:${minutes}` + (is12hr ? `${timeCode}` : ``))
            .addField(`PT`, `${PT}:${minutes}` + (is12hr ? `${timeCode}` : ``));
            
        message.channel.send(embed);

        console.log(givenTime + " = " + hours + ":" + minutes);


    }
}