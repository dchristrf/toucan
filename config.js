import dotenv from "dotenv";
dotenv.config();

const REQUIRED = [
  "DISCORD_APP_CLIENT_ID",
  "DISCORD_BOT_TOKEN",
  "GUILD_ID",
  "MEMBER_ROLE_ID",
  "COUNCIL_ROLE_ID",
  "APPLICATION_CHANNEL_ID",
  "MODERATOR_CHANNEL_ID",
  "AIRTABLE_KEY",
  "AIRTABLE_ID",
];

const missing = [];
REQUIRED.forEach((v) => {
  if (!process.env[v] || process.env[v] === "") {
    missing.push(v);
  }
});
if (missing.length) {
  throw new Error(
    `CRITICAL ERROR. Missing values for env vars: ${JSON.stringify(
      missing
    )}. Add these to .env file`
  );
}

export default {
  // discord bot settings
  clientId: process.env.DISCORD_APP_CLIENT_ID,
  discordBotToken: process.env.DISCORD_BOT_TOKEN,
  // other discord settings
  guildId: process.env.GUILD_ID,
  memberRoleId: process.env.MEMBER_ROLE_ID,
  councilRoleId: process.env.COUNCIL_ROLE_ID,
  applicationChannelId: process.env.APPLICATION_CHANNEL_ID,
  moderatorChannelId: process.env.MODERATOR_CHANNEL_ID,
  welcomeChannelId: process.env.WELCOME_CHANNEL_ID,
  // voting config
  councilVoteThreshold: process.env.COUNCIL_VOTE_THRESHOLD
    ? parseInt(process.env.COUNCIL_VOTE_THRESHOLD)
    : 5,
  // airtable
  airtableKey: process.env.AIRTABLE_KEY,
  airtableId: process.env.AIRTABLE_ID,
};
