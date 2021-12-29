import { default as config } from "../config.js";
import { getApprovingCouncilMembers } from "./index.js";
import {
  addRecord,
  getRecordsBySingleFilter,
  updateRecord,
} from "./airtable.js";

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

  const isApproved =
    approvingCouncilMembers.length >= config.councilVoteThreshold;
  const isPendingOneApproval =
    approvingCouncilMembers.length === config.councilVoteThreshold - 1;

  if (isApproved) {
    const msg = `✅ Applicant ${reaction.message.author} was approved by ${approvingCouncilMembers}! ${reaction.message.url}`;

    const channel = client.channels.cache.find(
      (channel) => channel.id === config.moderatorChannelId
    );
    console.log(msg);
    channel.send(msg);

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
