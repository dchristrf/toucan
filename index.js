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
