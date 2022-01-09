import { default as config } from "../config.js";
import { getApprovingCouncilMembers } from "./index.js";
import {
  addRecord,
  getRecordsBySingleFilter,
  updateRecord,
} from "./airtable.js";
import welcomeMsg from "./util/welcomeMsg.js";
import getSuperVoter from "./getSuperVoter.js";

async function handleReaction(client, reaction) {
  if (reaction.message.partial) {
    await reaction.message.fetch();
  }

  // update cache
  await reaction.message.guild.members.fetch();

  let applicant = reaction.message.author;

  // check first if the application creator is already a member
  const applicantIsMember = reaction.message.guild.members
    .resolve(applicant)
    ?.roles?.cache?.some((r) => r.id === config.memberRoleId);

  if (applicantIsMember) return;

  // Applicant is not yet a member. Proceed to analyze reactions
  const approvingCouncilMembers = await getApprovingCouncilMembers(reaction);

  const superVoter = await getSuperVoter(reaction);

  const isApproved =
    !!superVoter ||
    approvingCouncilMembers.length >= config.councilVoteThreshold;
  const isPendingOneApproval =
    approvingCouncilMembers.length === config.councilVoteThreshold - 1;

  if (isApproved) {
    let modMsg = `✅ Applicant ${applicant} was `;
    if (!!superVoter) {
      modMsg += `approved by super vote from ${superVoter}! `;
      const otherVoters = approvingCouncilMembers.filter(
        (u) => u.id !== superVoter.id
      );
      if (otherVoters.length) {
        modMsg += `They also received votes from ${otherVoters}`;
      }
    } else {
      modMsg += `approved by ${approvingCouncilMembers}!`;
    }

    modMsg += `\n${reaction.message.url}`;

    // Send message to Mods
    const modChannel = client.channels.cache.find(
      (channel) => channel.id === config.moderatorChannelId
    );
    console.log(modMsg);
    console.log({ approving: approvingCouncilMembers.map((c) => c.username) });
    modChannel.send(modMsg);

    // Send message to welcome, if enable
    if (config.welcomeChannelId) {
      const welcomeMsg = `The forest thickens with a new Rain Maker: ${applicant}! Welcome - it's great to have you here!\n\nFellow Rain Makers can see the original application here: ${reaction.message.url}\n\nFeel free to post an extended intro and link to your twitter below ⬇️  `;
      const welcomeChannel = client.channels.cache.find(
        (channel) => channel.id === config.welcomeChannelId
      );
      welcomeChannel.send(welcomeMsg);
    }

    // Assign "Member" role to applicant
    const promotee = reaction.message.channel.guild.members.cache.find(
      (member) => member.user.id == applicant.id
    );
    promotee.roles.add(config.memberRoleId);

    // Log approval to Airtable "Approvals" table
    addRecord("Approvals", {
      MessageId: reaction.message.id,
      DiscordUserId: reaction.message.author.id,
      DiscordUserName: reaction.message.author.username,
      ApplicationLink: reaction.message.url,
      MemberVoteCount: approvingCouncilMembers.length,
      Approvers: approvingCouncilMembers.map((u) => u.username).join(", "),
    });
    // Update application status to "approved" in "Applications" table
    const applicationRecord = (
      await getRecordsBySingleFilter(
        "Applications",
        "MessageId",
        reaction.message.id
      )
    )[0];
    updateRecord("Applications", applicationRecord.id, { Approved: true });

    // Send DM to new member
    applicant.send(welcomeMsg(applicant.username));
  } else if (isPendingOneApproval) {
    const channel = client.channels.cache.find(
      (channel) => channel.id === config.moderatorChannelId
    );
    channel.send(
      `☝️ Applicant ${reaction.message.author} just needs 1 council member vote to become a member. They have **${approvingCouncilMembers.length}** unique council votes! Review here and vote with an emoji if you approve: ${reaction.message.url}`
    );
  }
}

export default handleReaction;
