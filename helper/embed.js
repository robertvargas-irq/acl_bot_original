const { MessageEmbed } = require('discord.js');
const config = require('../config.json');
const R6API = require('r6api.js').default;
const fs = require('fs');
const moment = require('moment');
const labels = require('../helper/labels.json');
const LEAGUES = ['*💠 Pro-League*', '🔹 Challenger League', 'Qualifier'];
const USER_COLOR = "#5c5353";
const SUCCESS_COLOR = "#d179b1";
const ERROR_COLOR = "#5c1313";
const PLACEH_THUMBNAIL = "https://via.placeholder.com/256?text=Team+Thumbnail";
const PLACEH_BANNER = "https://via.placeholder.com/750x500?text=Team+Banner";

// INIT R6API
const { UBI_EMAIL: email, UBI_PASSWORD: password } = config.ubi;
const r6api = new R6API({ email, password });
r6api.getAuth().catch(e => console.log(e));

class Team {
    /**
     * Create a dynamic team embed
     * @param {Object} info Full parsed teamInfo.json data
     * @param {Role} teamObject Discord.Role object
     */
    constructor( info, teamObject ) {
        this.info = info;
        this.team = teamObject;
        this.directory = `./servers/${info.guild}/teams/${info.name.toLowerCase()}`
        this.embed = new MessageEmbed()
            .setColor( JSON.parse( fs.readFileSync(`./servers/${info.guild}/data/colors.json`) ).leagueColors[info.league] || 0x040404 ) // gets specified league color
            .setFooter('© Provided by Ascension League')
            .setTimestamp();
    }

    display() {
        let embed = new MessageEmbed( this.embed )
            .setTitle(`${this.info.emojiID || ''} ${this.info.name} ${this.info.badges.join(' ')}`)
            .setThumbnail( this.info.logo || PLACEH_THUMBNAIL )
            .setImage( this.info.banner || PLACEH_BANNER )
            .setDescription( '**' + (LEAGUES[this.info.league] || '❌ Unassigned League') + '**\n' +
                '> ❝ ' + ( this.info.mission || 'no mission statement' ) + ' ❞')
            .addFields(
                { name: 'Victories', value: '>>> **' + this.info.wins.toString() + '**', inline: true },
                { name: 'Seasons Played', value: '>>> **' + this.info.seasons.toString() + '** seasons', inline: true },
                { name: 'Member Count', value: '>>> **' + this.team.members.size + '** player(s)', inline: true },
                
                { name: '\u200B', value: '\u200B', inline: true },

                { name: 'Our Story', value: '>>> ◤\n' + ( this.info.biography || '\nNo biography or story set.\n' ) + '\n◣' }
            );
        return {
            content: labels.beta,
            embed: embed
        }
    }
}

class User {
    constructor( info, user ) {
        this.info = info;
        this.directory = `./servers/${info.guild}/users/${info.id}.json`;
        this.embed = new MessageEmbed()
            .setColor( info.color || USER_COLOR )
            .setTitle(`${user.username} ${this.info.badges.join(' ')}`)
            .setThumbnail( user.avatarURL() )
            .setFooter('© Provided by Ascension League')
            .setDescription( '>>> ' + ( this.info.quote || 'No quote yet!' ) )
            .addFields(
                { name: 'Ubisoft (PC)', value: '>>> `' + ( info.ubisoft || 'None provided' ) + '`' },

                { name: 'Team', value: '>>> ' + ( ( info.team.emoji || '' ) + ' ' + ( info.team.name || 'Not affiliated' ) ) },

                // { name: 'Staff', value: '>>> ' + ( info.staff.join(', ') || 'Regular user' ) },
                { name: 'My Story', value: '>>> ◤\n' + ( info.bio || '\nNothing to see here!\n' ) + '\n◣' },

                { name: 'Discord Join', value: `>>> ${moment(user.createdAt).format('MMMM Do, YYYY')}`, inline: true },
                { name: 'Server Join', value: `>>> ${moment(user.joinedAt).format('MMMM Do, YYYY')}`, inline: true },
            )
            .setTimestamp();
    }

    display() {
        return {
            content: labels.beta,
            embed: new MessageEmbed( this.embed )
        }
    }

}

class Player {
    constructor( info, user, team, seasonName = false ) {
        this.ubisoft = info.ubisoft;
        this.info = info.player;
        this.user = user;
        this.season = seasonName || false,
        this.team = JSON.parse( fs.readFileSync(`./servers/${info.guild}/teams/${team.name}/teamInfo.json`) );
        this.directory = `./servers/${info.guild}/users/${info.id}.json`;
        this.embed = new MessageEmbed()
            .setColor( info.color || USER_COLOR )
            .setTitle(`${user.username} ${info.badges.join(' ')}`)
            .setThumbnail( user.avatarURL() )
            .setFooter('© Stats provided by R6API')
            .setDescription('>>> ' + ( this.team.emojiID || '' ) + ' ' + ( this.team.name || 'No team currently defined.' ) )
            .setTimestamp();
    }

    async display() {
        const CURR_SEASON = 22;
        let S_NUM = 22;

        let r6;
        let pvp_ranked;
        let buffer;
        let warn = '';
        
        // CUSTOM SEASON SEARCH
        const seasons = ['operation shifting tides',
            'operation void edge', 'operation steel wave',
            'operation shadow legacy', 'operation neon dawn',
            'operation crimson heist', 'operation north star'];
        if ( this.season ) {
            let tempQuery = this.season.toLowerCase();
            seasons.some( (s, index) => {
                if ( s.includes( tempQuery ) )
                    S_NUM = index + 16;
            });
        }

        // parse info
        if ( this.ubisoft ) {
            r6 = await this.fetchR6( this.ubisoft, S_NUM );
            if ( !r6 ) {
                buffer = 'Invalid Ubisoft Username';
                warn = '(⚠ **INVALID USERNAME** ⚠) ';
            }
            else
                pvp_ranked = r6.ranked.seasons[S_NUM].regions.ncsa.boards.pvp_ranked;
        }
        else buffer = 'No Ubisoft Account on file';

        const rank = ( r ) => {
            if ( r > 5000 )
                return 'Champion';
            else if ( r > 4400 )
                return 'Diamond';
            else if ( r > 3200 )
                return 'Platinum';
            else if ( r > 2600 )
                return 'Gold';
            else if ( r > 2100 )
                return 'Silver';
            else if ( r > 1600 )
                return 'Bronze';
            else if ( r > 0 )
                return 'Copper';
            else
                return 'Unranked';
        };

        let embed = new MessageEmbed( this.embed )
            .addFields(
                { name: 'Ubisoft (PC)', value: '>>> `' + ( buffer || warn + this.ubisoft || 'None provided' ) + '`' },
                
                { name: 'Main Attacker', value: '>>> ' + ( this.info.attack || 'None' ), inline: true },
                { name: 'Main Defender', value: '>>> ' + ( this.info.defense || 'None' ), inline: true },
                
                { name: 'Position', value: '>>> ' + ( this.info.position || 'Not assigned' ) },



                { name: '\u200B', value: '\u200B' },



                { name: ( S_NUM == CURR_SEASON ? '[Current] ' : '' ) + 'Season', value: '>>> ' + ( buffer || '`Operation ' + r6.ranked.seasons[S_NUM].seasonName + '`' ) },

                { name: 'Top Rank', value: '>>> `' + ( buffer || rank( pvp_ranked.max.mmr ) ) + '`', inline: true },
                { name: ( S_NUM == CURR_SEASON ? 'Current ' : 'Final ') + 'Rank', value: '>>> `' + ( buffer || rank( pvp_ranked.current.mmr ) ) + '`', inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
                
                { name: 'K/D', value: '>>> `' + ( buffer || 'C: ' + pvp_ranked.kd.toFixed(2).toString() + '`\n`O: ' + r6.stats.pvp.general.kd.toFixed(2).toString() ) + '`', inline: true },
                { name: 'Kills', value: '>>> **' + ( buffer || 'C: ' + pvp_ranked.kills.toString() + '\nO: ' + r6.stats.pvp.general.kills.toString() ) + '**', inline: true },
                { name: 'Deaths', value: '>>> **' + ( buffer || 'C: ' + pvp_ranked.deaths.toString() + '\nO: ' + r6.stats.pvp.general.deaths.toString() ) + '**', inline: true },
                
                { name: 'Win Percentage', value: '>>> `' + ( buffer || 'C: ' + pvp_ranked.winRate.toString().padStart(6, "0") + '`\n`O: ' + r6.stats.pvp.general.winRate.toString().padStart(6, "0") ) + '`', inline: true },
                { name: 'Total Wins', value: '>>> ' + ( buffer || 'C: ' + pvp_ranked.wins.toString() + '\nO: ' + r6.stats.pvp.general.wins.toString() ), inline: true },
                { name: 'Total Matches', value: '>>> ' + ( buffer || 'C: ' + pvp_ranked.matches.toString() + '\nO: ' + r6.stats.pvp.general.matches.toString() ), inline: true },
                
                { name: 'Total Playtime', value: '>>> ' + ( buffer || (Math.floor(r6.stats.pvp.general.playtime/3000 )).toString() + ' hours' ), inline: true },

                

                { name: '\u200B', value: '\u200B' },
                


                { name: 'Server Join', value: `>>> ${moment(this.user.joinedAt).format('MMMM Do, YYYY')}` },
            );

        if ( r6 ) embed
            .setAuthor('\u200B', this.user.avatarURL())
            .setThumbnail( r6.player.avatar['500'] )
            .setImage( r6.ranked.seasons[S_NUM].seasonImage );;

        return {
            content: labels.beta,
            embed: embed
        }
    }

    async fetchR6( username, season ) {
        if ( !username ) {
            console.log('No username');
            return false;
        }
        const platform = 'uplay';
        
        const { 0: player } = await r6api.findByUsername( platform, username );
        console.log({player: player});
        if ( !player ) return false;

        const statsPromise = r6api.getStats( platform, player.id );
        const rankedPromise = r6api.getRanks( platform, player.id, { seasonIds: season, regionIds: 'ncsa' } );
        
        const [{ 0: ranked }, { 0: stats }] = await Promise.all([ rankedPromise, statsPromise ]);
        if ( !ranked || !stats ) return false;
        // console.log({ranked : ranked.seasons['22'].regions.ncsa.boards.pvp_ranked })

        return { player, stats, ranked };
    }
}
function error( reason ) {
    return new MessageEmbed()
        .setColor(ERROR_COLOR)
        .setAuthor('⚠ Uh oh! Something went wrong!')
        .setDescription('>>> ' + reason);
}

module.exports = { Team, User, Player, error, SUCCESS_COLOR, ERROR_COLOR };