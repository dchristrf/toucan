import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { default as config } from "../config.js";

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!"),
  new SlashCommandBuilder()
    .setName("whoami")
    .setDescription("Bot will introduce itself!"),
  new SlashCommandBuilder()
    .setName("pending")
    .setDescription(
      "Returns a list of pending applications. Council and members only."
    ),
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(config.discordBotToken);

rest
  .put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
    body: commands,
  })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
