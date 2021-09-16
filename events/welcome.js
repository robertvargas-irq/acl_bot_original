const Discord = require('discord.js');
const fs = require('fs');
const Canvas = require('canvas');
const WELCOME_TITLES = [
    "Welcome!",
    "¡Bienvenido!",
    "Bienvenue!",
    "Bonjour!",
    "Ciao!",
    "Willkommen!",
    "Benvenuto!",
    "Bem-vindo!",
    "Välkommen!"
]
const WELCOMES = [
    "Stick around, and kick back!",
    "Jump right on in!",
    "We saved a spot just for you!",
    "Don't just stand there, get chatting!",
    "Hope you enjoy your stay!",
    "Don't forget your roles!",
    "Leave your shoes at the door!",
    "Prepare to set sail!",
    "We'll lend you a hand with your luggage!",
    "Your ticket checks out! Welcome aboard!",
    "Take a tour!",
    "Check out the roles on your way in!",
    "Watch your head as you enter!",
    "The league is straight ahead!",
    "Watch out for the enemy team!"
];
const FAREWELLS = [
    "Sad to see you go.",
    "Safe travels!",
    "Have a safe flight!",
    "Be safe!",
    "We'll save a seat for ya!",
    "Happy sightseeing!",
    "Don't be afraid to visit!",
    "Dont forget your coat!",
    "Don't forget your shoes!",
    "You've left some big shoes to fill!",
    "We'll never forget ya!"
]

var WT_cache = -1;
var W_cache = -1;
var F_cache = -1;

module.exports = (client) => {
    
    client.on('guildMemberAdd', async (member) => {

        console.log('A new member has joined!')
        console.log({
            member : `${member.user.tag} (${member.user.id})`,
            guild : `${member.guild.name} (${member.guild.id})`,
        });

        // get welcome channel
        const channelId = JSON.parse( fs.readFileSync(`./servers/${member.guild.id}/data/channels.json`) ).welcomeBanner;
            if (!channelId) return console.log(`[not] ${member.user.username} has joined!\n[---] There is no welcome channel set up yet!`);
        const channel = member.guild.channels.cache.get(channelId);
        const accent = JSON.parse( fs.readFileSync(`./servers/${member.guild.id}/data/colors.json`) ).welcomeBanner;
        const roles = JSON.parse( fs.readFileSync(`./servers/${member.guild.id}/data/roles.json`) )

        //console.log(member);

        function determiner() {
            const temp = client.guilds.cache.get(member.guild.id).memberCount;
            const calc = temp % 10;

            switch (calc) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        }

        const canvas = Canvas.createCanvas(700, 250);
        const ctx = canvas.getContext('2d');
        const background = await Canvas.loadImage(`./assets/join_backgrounds/${member.guild.id}.png`);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#C0C0C0';
        ctx.strokeRect(0, 0, canvas.width - 5, canvas.height - 5);

        const offset = -80;
        const fixedWidth = 6;
        ctx.font = '32px Calibri';
        ctx.fillStyle = '#F8F8F8';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = fixedWidth;
        //ctx.strokeText(`Welcome to ${member.guild.name}!`, canvas.width / 2.5 + offset, canvas.height / 3.5);
        //ctx.fillText(`Welcome to ${member.guild.name}!`, canvas.width / 2.5 + offset, canvas.height / 3.5);

        if (member.user.username.length >= 19) {
            ctx.font = '35px Calibri';
            ctx.fillStyle = accent;
            ctx.strokeStyle = 'black';
            ctx.lineWidth = fixedWidth;
            ctx.textAlign = 'right';
            ctx.strokeText(`${member.user.username}#${member.user.discriminator}`, canvas.width + offset, canvas.height / 1.9 + 0.5);
            ctx.fillText(`${member.user.username}#${member.user.discriminator}`, canvas.width + offset, canvas.height / 1.9 + 0.5);
        } else {
            ctx.font = '45px Calibri';
            ctx.fillStyle = accent;
            ctx.strokeStyle = 'black';
            ctx.lineWidth = fixedWidth;
            ctx.textAlign = 'right';
            ctx.strokeText(`${member.user.username}#${member.user.discriminator}`, canvas.width + offset, canvas.height / 1.9 + 0.5);
            ctx.fillText(`${member.user.username}#${member.user.discriminator}`, canvas.width + offset, canvas.height / 1.9 + 0.5);
        }

                ctx.font = '28px Calibri';
                ctx.fillStyle = '#F8F8F8';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = fixedWidth;
                ctx.textAlign = 'left';
                ctx.strokeText(`You are our ${client.guilds.cache.get(member.guild.id).memberCount}${determiner()} member!`, canvas.width / 2.45 + offset + 40, canvas.height / 1.44 + 24);
                ctx.fillText(`You are our ${client.guilds.cache.get(member.guild.id).memberCount}${determiner()} member!`, canvas.width / 2.45 + offset + 40, canvas.height / 1.44 + 20);
        ctx.beginPath();
        ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        const avatar = await Canvas.loadImage(member.user.avatarURL({ format: 'png', size: 512 }));
        ctx.drawImage(avatar, 25, 25, 200, 200);
        
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');

        // unique welcomes
        let rand1 = Math.floor(Math.random() * WELCOME_TITLES.length);
            if ( rand1 == WT_cache )
                if ( rand1 == WELCOME_TITLES.length - 1 ) rand1--;
                else rand1++;
        let welcomeTitle = WELCOME_TITLES[rand1];
        WT_cache = rand1;

        let rand2 = Math.floor(Math.random() * WELCOMES.length);
            if ( rand2 == W_cache )
                if ( rand2 == WELCOMES.length - 1 ) rand2--;
                else rand2++;
        let welcomeMsg = WELCOMES[rand2];
        W_cache = rand2;

        const welcomeEmbed = new Discord.MessageEmbed()
            //.setAuthor(`👋`, client.guilds.cache.get(member.guild.id).members.cache.get('758208469185986581').user.avatarURL())
            .setTitle(welcomeTitle)
            .setColor(accent)
            //.setThumbnail(client.guilds.cache.get(member.guild.id).members.cache.get('758208469185986581').user.avatarURL({ format: 'png', size: 512 }))
            .setDescription(`Hey there <@${member.user.id}>, welcome to **${member.guild.name}**!\nWe are so happy to have you join us! __${welcomeMsg}__`)
            .setTimestamp()
            .setFooter(`Irii © 2021`)
            .setImage("attachment://welcome-image.png")
            .attachFiles(attachment);

        channel.send(welcomeEmbed);

        let verifiedRole = roles.verified;
        let communityRole = roles.community;
        
        member.roles.add(verifiedRole);
        member.roles.add(communityRole);
        return;
    });

    client.on('guildMemberRemove', async (member) => {
        // get welcome channel
        const channelId = JSON.parse( fs.readFileSync(`./servers/${member.guild.id}/data/channels.json`) ).leaveBanner;
            if (!channelId) return console.log(`[not] ${member.user.username} has joined!\n[---] There is no welcome channel set up yet!`);
        const channel = member.guild.channels.cache.get(channelId);
        const accent = JSON.parse( fs.readFileSync(`./servers/${member.guild.id}/data/colors.json`) ).leaveBanner;

        // unique message
        let rand3 = Math.floor(Math.random() * FAREWELLS.length);
            if ( rand3 == F_cache )
                if ( rand3 == FAREWELLS.length - 1 ) rand3--;
                else rand3++;

        let farewellMsg = FAREWELLS[rand3];
        F_cache = rand3;

        const leaveEmbed = new Discord.MessageEmbed()
            .setAuthor(`${member.user.username} has left the server`, member.user.avatarURL())
            .setColor(accent)
            .setFooter(farewellMsg)
            .setTimestamp()

        channel.send(leaveEmbed);
    });
}