# About

Toucan is a Discord bot for streamlining Chainforest's DAO membership onbaording process. This is a modfied clone of BlankFoundation's [blankbot](https://github.com/BlankFoundation/blankbot)

# Install

- Clone this repository
- npm install

# Running locally

make sure you have node > v16.13.1 installed locally, if not, checkout [nvm](https://github.com/nvm-sh/nvm) or some other node version manager

```
npm install
cp .env.example .env
```

Fill out all the variable values in the new .env file.

To develop the bot locally, you will need to create a:

- development discord server
- development bot

## Add bot to Discord dev server

`npm run add-bot`

Will produce a link for adding the bot to servers over which you have admin control.

## Prerequisites

Go to discord settings and turn developer mode on.
![Image 2021-12-12 at 9 36 13 PM](https://user-images.githubusercontent.com/2502947/145743785-75957609-0f12-43e0-b9b2-b7d2c838a9f2.jpg)

## Create Discord Development Server

Use the [Blank Foundation Server Template](https://discord.new/xxbhaey7szrC) to create a development blank foundation discord server.
![Create Bot Server](docs/img/CreateDevBot.gif)

## Create Discord Development Bot

You can create your own development bot in 3 steps

- [Create a New Application on discord developer portal](https://discord.com/developers/applications) with a name
- Create a bot for the application. Go to the `Bot` section, create a bot.
- In `config.js` add `clientId: <0AuthClientId>` which is located in the application settings.
  ![Image 2021-12-12 at 9 44 51 PM](https://user-images.githubusercontent.com/2502947/145744475-a9d71ac9-f0f6-4667-94c9-304b585e4fdf.jpg)
- In `config.js` add `"discordToken": <discordToken>` located in the application settings.
  ![Image 2021-12-12 at 9 48 25 PM](https://user-images.githubusercontent.com/2502947/145744771-ac3e62cb-e4f3-4604-b6e4-322fad977716.jpg)

## Enable Privileged Intent

For the bot to access members on a server, discord requires a "Privileged Intent" GUILD_MEMBERSHIP
You need enable it in the bot settings

![Enable Privileged Intent](docs/img/EnablePrivilegedIntent.gif)

## Add Dev Bot to Dev Server

Run this script and open the generated link in browser to add your bot

```
node addDevBot.js
```

# Running tests

npm run test
