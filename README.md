# `(DEPRECATED)` Original `[Name Change Pending]` League Discord Bot

## Brief overview
`This project is no longer being updated as the focus has been shifted to the rewritten upgrade "CLN-C."`<br>
This is the official Discord Bot for the Discord server and professional Rainbow Six League by the name of `[Name Change Pending]`.

This feature-rich bot contains full moderation commands to keep the server and community in line, chat filter, user-friendly roster and team management, customizable news feed with role-pickers to choose which notifications you receive, administrative functions to send official announcements either through direct message or to the public server. Additionally, a database to store team information such as team ID, players (user IDs), roster, cosmetic options, and game data collected throughout the season, as well as fully-fledged Vanity User Profiles, containing in-game statistics for each user, custom biographies, colors, pronouns, and other forms of personal expression.

This program is written entirely in JavaScript, organized with Node Project Manager, and utilizing the NodeJS API.
Additionally, Discord.js v12 is used, which can be found [here at their official website](https://discord.js.org/#/docs/main/v12/general/welcome). \[[GitHub repository](https://github.com/discordjs/discord.js)\]

---

## Features

- Team roster management
  > Intuitive way to manage team rosters with the `;;roster` command group, along with league administrators being able to impose limits on the amount of main and substitute players allowed in the team roster based on the league rules.
- Vanity Profiles for Every User
  > Show off your in-game statistics, rep your team, or shout your underdog story from the rooftops with custom vanity profiles for all server users.<br>
  > Pulls Rainbow Six Siege in-game stats via r6api.js \[[GitHub repository](https://github.com/danielwerg/r6api.js)\] and displays them in a custom Message Embed to show off in-game winnings and rank, along with displaying the user profile picture from both Discord and their Ubisoft Account.
- Custom news-feed
  > Dynamic menus to choose which notifications users wish to receive by assigning roles to their user profile. Additionally, these menus are dynamic in which they can be easily changed by modifying the respective JSON file storing the data for each option.
- Greeting card with user's name and profile picture, welcoming them upon joining the server.
- Administrative functions
  > - Time mute, kick, or ban disruptive users.
  > - Delete messages en-masse in case of disruptive behavior.
  > - Set roster limits in accordance to the Ascension League rulebook; configuration and limits are stored in the serverdata JSON.
  > - Push out notifications to users directly or en-masse, via team channel, or to an official announcement channel via the `;;direct` command group.
- Custom, simple user and team database
  > Team data is stored in each individual server by unique Discord server ID, allowing for dynamic expansion beyond the original intent, allowing for the bot to be deployed in other environments if the project were to ever go public to allow other leagues to take advantage of the features "CLN-C" has to offer.
  > User data is stored in the same manner, and allows for flexibility.
  > Both types of data streamline the process of adding new features as each user and team gets their own data stored, which leaves the door open to new features down the line.

---

> This bot is no longer in development, it's successor is currently being programmed and is out on Beta.

---
