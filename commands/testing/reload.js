const { User } = require("discord.js");

module.exports = {
    name: 'reload',
    aliases: false,
    category: 'OWNER',
    hide: true,
    description: "Debug; reloads a command.",
    usage: '[command name]',
    
    // Properties 
    guildOnly: true,
    args: true,
    cooldown: 1,
    ownerOnly: true,

    execute(message,args) {

        if (!message.member.permissions.has('ADMINISTRATOR')) return message.channel.send("You do not have the authorization to use this command.");
        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName)
            || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send(`There is no command with the name or alias \`${commandName}\`, ${message.author}!`);

        delete require.cache[require.resolve(`./${command.name}.js`)];

        try {
            const newCommand = require(`./${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);

            message.channel.send(`Command \`${command.name}\` was reloaded!`);

        } catch (error) {
            console.error(error);
            message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``);
        }
    
    }
}