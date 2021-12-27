import { default as config } from "../config.js";
import { analyzeReactions } from "./index.js";

import Airtable from "airtable";

const applicationDatabase = new Airtable({ apiKey: config.airtableKey }).base(
  config.airtableId
);

function addReviewRecord(
  tableName,
  discordUserName,
  discordUserId,
  applicationLink,
  numUniqueEmojis
) {
  applicationDatabase(tableName).create(
    [
      {
        fields: {
          DiscordUserName: discordUserName,
          DiscordUserId: discordUserId,
          ApplicationLink: applicationLink,
          NumUniqueEmojis: numUniqueEmojis,
        },
      },
    ],
    function (err, _records) {
      if (err) {
        console.error(err);
        return;
      }
    }
  );
}

async function getDiscordUserIdPresent(tableName, value) {
  let matchingRecords = [];
  await applicationDatabase(tableName)
    .select({
      filterByFormula: "({DiscordUserId} = '" + value + "')",
    })
    .eachPage(function page(records, fetchNextPage) {
      try {
        records.forEach(function (record) {
          matchingRecords.push(record);
        });
      } catch (e) {
        console.log("error inside eachPage => ", e);
      }
      fetchNextPage();
    });
  return matchingRecords;
}

const handleApplication = async (client, reaction) => {
  if (reaction.message.partial) {
    console.log("partials present");
    await reaction.message.fetch();
  }
  // check first if the application creator is already a member
  // update cache
  await reaction.message.guild.members.fetch();
  let user = reaction.message.author;
  const isMember = reaction.message.guild.members
    .resolve(user)
    ?.roles?.cache?.some((r) => r.name === "Member");

  console.log({ isMember });
  if (!isMember) {
    const reactionAnalysis = await analyzeReactions(reaction);
    const { numDoubles, uniqueMemberReactions, hasCouncilMemberReaction } =
      reactionAnalysis;
    // TODO: REMOVE
    console.log({ reactionAnalysis });
    console.log({ reactionaMsg: reaction.message });
    if (
      // uniqueMemberReactions >= 5 &&
      // numDoubles < 5 &&
      hasCouncilMemberReaction
    ) {
      // if (
      //   uniqueMemberReactions >= 5 &&
      //   numDoubles < 5 &&
      //   hasCouncilMemberReaction
      // ) {
      // send message to #moderators channel with notification to approve application
      console.log(
        `Applicant ${reaction.message.author.username} is ready for review with ${uniqueMemberReactions} unique emojis! ${reaction.message.url}`
      );
      const channel = client.channels.cache.find(
        (channel) => channel.id === config.moderatorChannelId
      );
      channel.send(
        `Applicant ${reaction.message.author.username} is ready for review with ${uniqueMemberReactions} unique emojis! ${reaction.message.url}`
      );
      let tableName = "ReadyForPromotion";
      var userIdMatches = await getDiscordUserIdPresent(
        tableName,
        reaction.message.author.id
      );
      console.log({ userIdMatches });
      if (!userIdMatches.length) {
        addReviewRecord(
          tableName,
          reaction.message.author.username,
          reaction.message.author.id,
          reaction.message.url,
          uniqueMemberReactions,
          reaction.message.createdTimestamp
        );
      }
    } else if (
      uniqueMemberReactions >= 5 &&
      numDoubles < 5 &&
      !councilMemberReaction
    ) {
      const channel = client.channels.cache.find(
        (channel) => channel.id === config.moderatorChannelId
      );
      channel.send(
        `Applicant ${reaction.message.author.username} just needs 1 council member / contributor vote to advance. They have ${uniqueMemberReactions} unique emojis! ${reaction.message.url}`
      );
      let tableName = "CouncilContributorVoteNeeded";
      const userNameMatches = await getDiscordUserIdPresent(
        tableName,
        reaction.message.author.id
      );
      if (!userNameMatches.length) {
        addReviewRecord(
          tableName,
          reaction.message.author.username,
          reaction.message.author.id,
          reaction.message.url,
          uniqueMemberReactions,
          reaction.message.createdTimestamp
        );
      }
    }
  }
};

export default handleApplication;
