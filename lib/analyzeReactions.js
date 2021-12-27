/** Assesses the number of unique member votes and whether or not a council vote is present on an application message, based on a trigger reaction on said message */
async function analyzeReactions(triggerReaction) {
  if (triggerReaction.message.partial) {
    await triggerReaction.message.fetch();
  }

  await triggerReaction.message.guild.members.fetch();

  const memberIds = new Set();
  let approvingCouncilMembers = [];

  const reactions = await triggerReaction.message.reactions.cache.map((r) => r);

  await Promise.all(
    reactions.map(async (r) => {
      const rUsers = await r.users.fetch();
      rUsers.forEach((u) => {
        const isMember = !!triggerReaction.message.guild.members
          .resolve(u)
          ?.roles?.cache?.find((r) => r.name === "Member");
        const isCouncil = !!triggerReaction.message.guild.members
          .resolve(u)
          ?.roles?.cache?.find((r) => r.name === "Council");
        if (isMember) {
          memberIds.add(u.id);
        }
        if (isCouncil) {
          const isUniqueCouncil =
            approvingCouncilMembers.find((c) => c.id === u.id) === undefined;
          if (isUniqueCouncil) {
            approvingCouncilMembers.push(u);
          }
        }
      });
    })
  );
  const uniqueMemberReactions = [...memberIds].length;
  const hasCouncilReaction = !![approvingCouncilMembers].length;

  return {
    uniqueMemberReactions,
    hasCouncilReaction,
    approvingCouncilMembers,
  };
}

export default analyzeReactions;
