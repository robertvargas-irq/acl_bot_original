const Discord = require('discord.js');
const { Collection } = require('discord.js');
const client = new Discord.Client();
const categories = new Collection();
const cooldowns = new Collection();

const fs = require('fs');

const config = require('./config.json');
const prefix = config.prefix;
const embed = require('./helper/embed.js');

//const mongoose = require('./database/mongoose');
//mongoose.init();


// events
const welcome = require('./events/welcome.js');
const easterEggs = require('./events/keywords.js');
const filterSlurs = require('./filters/slurs.js');
const filterPolitics = require('./filters/politics.js');
const buttonEvents = require('./events/clickButton.js');

// initialize buttons
require('discord-buttons')(client);

// initialize .env
require('dotenv').config();

// FIXME: capture exceptions, temporary fix to catch error points
process.on("uncaughtException", async function( err ) {
    console.log('Caught exception: ' + err.stack );
    
    let dmEmbed = new Discord.MessageEmbed()
        .setColor( 0x010101 )
        .setTitle('New Auto Error Report')
        .setDescription(`\`\`\`${ err.stack.length > 2048 ? err.stack.toString().substring(0, 2048) : err.stack }\`\`\``)
    await client.users.cache.get( process.env.AUTHORID ).send( dmEmbed );

    const write = fs.createWriteStream( `./logs/Crash Log - ${Date().replace(/:/g, "-")}.txt` );
    write.write( `${Date()}\n\n`
        + `${err.stack}` );
    write.close();
});

// Gets all directories in the main folder - Only goes 1 down cannot find subfolders of subfolders
function getDirectories() {
	return fs.readdirSync('./commands').filter(function subFolder(file) {
		return fs.statSync('./commands/' + file).isDirectory();
	});
}
// Creates new discord collection
client.commands = new Discord.Collection();
// Reads normal .JS files in the main directory
let commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
// Loops through all the folders in the main dir and finds those with a .js extension
for (const folder of getDirectories()) {
	const folderFiles = fs.readdirSync('./commands/' + folder).filter(file => file.endsWith('.js'));
	for (const file of folderFiles) {
		commandFiles.push([folder, file]);
	}
}
// Takes the two different command and folder lists and requires all the commands into an array which then puts it into the collection
for ( const file of commandFiles ) {
	let command;
	if ( Array.isArray( file ) )
		command = require(`./commands/${file[0]}/${file[1]}`);
	
	else
		command = require(`./commands/${file}`);

	client.commands.set( command.name, command );
}



client.once('ready', () => {

    // declare 'ready' messages
    const onlineMessage = `${client.user.username} is now online!`;
    const bootTimeRegister = `| Boot time: ${Date()}`;

    try {
        welcome(client);
        easterEggs(client);
        filterSlurs(client);
        filterPolitics(client);
        buttonEvents(client);
    }
    catch (e) {
        console.log(e);
    }

    // register time of initiation
    for (length of bootTimeRegister) process.stdout.write('=');
    console.log(`\n${bootTimeRegister}`);
    process.stdout.write('| ');

    // display online message
    for (length of onlineMessage) process.stdout.write('\\');
    console.log('\n| Ascension Owl is now online!');
    process.stdout.write('| ');
    for (length of onlineMessage) process.stdout.write('/');
    process.stdout.write('\n==');
    for (length of onlineMessage) process.stdout.write('=');
    console.log();

    client.user.setPresence({
        activity: {
            name: `Living out its final moments | v${config.version} | ${prefix}help`,
            type: "WATCHING"
        },
        status: 'online'
    });

});

client.on('message', async message =>{

    if(!message.content.startsWith(prefix) || message.author.bot) return;

    // Slices the prefix out of the command
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Checks for a command
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    // Guild-Only Property
    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply('I can\'t execute that command inside DM\'s!');
    }

    // Args Property
    if (command.args && !args.length) {
        // let reply = `Incorrect input!`;
        let reply = new Discord.MessageEmbed()
            .setColor(embed.ERROR_COLOR)
            .setTitle('Incorrect input!')
            .setDescription( '>>> ' + ( command.usage ? command.usage : 'Error: No usage found!' ) );

        return message.channel.send({
            embed: reply
        });
    }

    // Cooldown Property
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = ( message.author.id === process.env.AUTHORID ? 1 : (command.cooldown || 3) ) * 1000;

    if ( timestamps.has(message.author.id) ) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second${timeLeft != 1 ? 's' : ''} before trying to send another command.`)
                .then(msg => {
                    msg.delete({timeout: 5000});
                });

        }
    }
    else {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    // Execute command.
    try {
        await command.execute( message, args, client );
    }
    catch ( error ) {
        
        const write = fs.createWriteStream( `./logs/Error Log - ${Date().replace(/:/g, "-")}.txt` );
        write.write( `${Date()}\n\n`
            + `Command: ${command.name}\n`
            + `Full: ${command.name} ${args.join(' ')}\n`
            + `Guild: ${message.guild.name} (${message.guild.id})\n`
            + `Caller: ${message.author.tag} (${message.author.id})\n`
            + `${error.stack}` );
        write.close();

        const colors = JSON.parse( fs.readFileSync(`./servers/${message.guild.id}/data/colors.json`) );
        const errorID = Math.floor( Math.random() * 0xFFFFF );
        console.log({
            ERROR_ID: errorID,
            ERROR: error
        });

        let embed = new Discord.MessageEmbed()
            .setTitle("⚠ Woah! Something went wrong!")
            .setColor( colors.negative )
            .setDescription("__There was a hiccup in trying to execute that command! An error report has been sent out and will hopefully be resolved soon!__\n\nIf the issue persists, please contact the bot owner directly at **(<@" + process.env.AUTHORID + ">)** in order to get the issue resolved!")
            .addField( 'Error ID', '`' + errorID + '`' )
            .setFooter(`Command user: ${message.author.username}`)
            .setTimestamp();
        message.channel.send({embed: embed});
        message.react('⚠');

        let errorForEmbed;
            if ( errorForEmbed < 2048 )
                errorForEmbed = error.stack;
            else
                errorForEmbed = error.stack.toString().substring(0, 2048);

        let errorEmbed = new Discord.MessageEmbed()
            .setTitle("⚠ Error Report - ID:" + errorID )
            .setColor( colors.negative )
            .setDescription(`A fatal error has occured in __**${message.guild.name}**__ that requires your attention.\nThis occured on: *${Date()}*`)
            .addField(`The original command parsed was: \`${command.name}\``, `**Full Contents:** \`${message.content}\``)
            .addField(`Link to the original message`, `> > [click here](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`)
            .setFooter(`Original user: ${message.author.username}`)
            .setTimestamp();
        let reportEmbed = new Discord.MessageEmbed()
            .setColor( colors.negative << -0x010101 )
            .setTitle(`Detail Report - ${command.category} / ${command.name}`)
            .setDescription(`\`\`\`${errorForEmbed}\`\`\``);
        
        let goTo = await client.guilds.cache.get(config.guild.testing).channels.cache.get(config.error_auto).send(errorEmbed);
        await client.guilds.cache.get(config.guild.testing).channels.cache.get(config.error_auto).send(reportEmbed);

            let dmEmbed = new Discord.MessageEmbed()
                .setColor(colors.negative)
                .setTitle('New Auto Error Report')
                .setDescription(`ID: [${errorID}](https://discord.com/channels/${config.guild.testing}/${config.error_auto}/${goTo.id})`)
            await client.users.cache.get( process.env.AUTHORID ).send( dmEmbed );
    }
});

client.login(config.token);
