import { default as config } from "../config.js";
import { getPendingApplications } from "../lib/airtable.js";

async function pending(interaction) {
  // gated command. Council/members only
  const isPermitted =
    interaction.member.roles.cache.some(
      (role) => role.id === config.memberRoleId
    ) ||
    interaction.member.roles.cache.some(
      (role) => role.id === config.councilRoleId
    );
  if (!isPermitted) {
    await interaction.reply(
      "Sorry, you do not have permission for that command"
    );
    return;
  }
  try {
    const pendingApplications = await getPendingApplications();

    const parsed = pendingApplications.map((a) => ({
      link: a.get("ApplicationLink"),
      username: a.get("DiscordUserName"),
    }));

    if (parsed.length) {
      let msg = "These users are awaiting approval:\n";
      parsed.forEach((a) => {
        msg += `- ${a.username}: ${a.link}\n`;
      });
      await interaction.reply(msg);
      return;
    } else {
      await interaction.reply("👌 No applications pending at this time!");
    }
  } catch (e) {
    console.error(e);
  }
}

export default pending;
