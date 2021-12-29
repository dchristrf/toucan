import { default as config } from "../config.js";

/** Assesses the number of unique member votes and whether or not a council vote is present on an application message, based on a trigger reaction on said message */
async function getApprovingCouncilMembers(triggerReaction) {
  if (triggerReaction.message.partial) {
    await triggerReaction.message.fetch();
  }

  await triggerReaction.message.guild.members.fetch();

  const councilMap = new Map();

  const reactions = await triggerReaction.message.reactions.cache.map((r) => r);

  await Promise.all(
    reactions.map(async (r) => {
      const rUsers = await r.users.fetch();
      rUsers.forEach((u) => {
        const isCouncil = !!triggerReaction.message.guild.members
          .resolve(u)
          ?.roles?.cache?.find((r) => r.id === config.councilRoleId);
        if (isCouncil) {
          councilMap.set(u.id, u);
        }
      });
    })
  );

  return [...councilMap.values()];
}

export default getApprovingCouncilMembers;
