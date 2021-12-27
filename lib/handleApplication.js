import { default as config } from "../config.js";
import { addRecord } from "./airtable.js";

async function handleApplication(_client, message) {
  if (message.partial) {
    await message.fetch();
  }
  // update cache
  await message.guild.members.fetch();

  let applicant = message.author;

  const isMember = message.guild.members
    .resolve(applicant)
    ?.roles?.cache?.some((r) => r.id === config.memberRoleId);

  if (isMember) {
    message.reply(`Silly ${applicant}, you're already a member!`);
  } else {
    addRecord("Applications", {
      MessageId: message.id,
      DiscordUserId: message.author.id,
      DiscordUserName: message.author.username,
      ApplicationLink: message.url,
      Approved: false,
    });
  }
}

export default handleApplication;
