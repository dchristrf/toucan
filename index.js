import { default as config } from "./config.js";

import * as commands from "./commands/index.js";

import { handleReaction, handleApplication } from "./lib/index.js";

import { Client, Intents } from "discord.js";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

// Register an event so that when the bot is ready, it will log a messsage to the terminal
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== config.applicationChannelId) return;

  console.log("New application");
  try {
    await handleApplication(client, message);
  } catch (err) {
    console.log(err);
  }
});

client.on("messageReactionAdd", async (reaction) => {
  if (reaction.message.channel.id !== config.applicationChannelId) return;

  console.log("New reaction");
  try {
    await handleReaction(client, reaction);
  } catch (err) {
    console.log(err);
  }
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  // check if the member was updated with the "member" role
  if (
    !oldMember.roles.cache.some((role) => role.id === config.memberRoleId) &&
    newMember.roles.cache.some((role) => role.id === config.memberRoleId)
  ) {
    const channel = client.channels.cache.find(
      (channel) => channel.id === config.welcomeChannelId
    );
    if (channel) {
      channel.send(
        `${newMember} has been promoted to Chainforest Rain Maker! Welcome! Feel free to look around and ask questions `
      );
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (commands[interaction.commandName]) {
    await commands[interaction.commandName](interaction);
  } else {
    await commands["notfound"](interaction);
  }
});

// client.login logs the bot in and sets it up for use. You'll enter your token here.
client.login(config.discordBotToken);
