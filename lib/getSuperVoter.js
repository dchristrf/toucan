import { default as config } from "../config.js";

/** Assesses the number of unique member votes and whether or not a council vote is present on an application message, based on a trigger reaction on said message */
async function getSuperVoter(triggerReaction) {
  if (triggerReaction.message.partial) {
    await triggerReaction.message.fetch();
  }

  await triggerReaction.message.guild.members.fetch();

  const superVoterMap = new Map();

  const reactions = await triggerReaction.message.reactions.cache.map((r) => r);

  await Promise.all(
    reactions.map(async (r) => {
      const rUsers = await r.users.fetch();
      rUsers.forEach((u) => {
        const isSuperVoter = u.id === config.superVoterId;
        if (isSuperVoter) {
          superVoterMap.set(u.id, u);
        }
      });
    })
  );
  const arr = [...superVoterMap.values()];
  if (arr.length) {
    return arr[0];
  } else {
    return null;
  }
}

export default getSuperVoter;
