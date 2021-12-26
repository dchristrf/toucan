import { default as config } from "../config.js";

import Airtable from "airtable";

const database = new Airtable({ apiKey: config.airtableKey }).base(
  config.airtableId
);

async function getDiscordUserIdAddresses(value) {
  let matchingRecords = [];
  await database("WhiteList")
    .select({
      filterByFormula: "({DiscordUserId} = '" + value + "')",
    })
    .eachPage(function page(records, fetchNextPage) {
      try {
        records.forEach(function (record) {
          matchingRecords.push(record.fields["WalletAddress"]);
        });
      } catch (e) {
        console.log("error inside eachPage => ", e);
      }
      fetchNextPage();
    });
  return matchingRecords;
}

async function countWalletAddresses() {
  let count = 0;
  await database("WhiteList")
    .select()
    .eachPage(function page(records, fetchNextPage) {
      try {
        records.forEach(function (record) {
          count += 1;
        });
      } catch (e) {
        console.log("error inside eachPage => ", e);
      }
      fetchNextPage();
    });
  return count;
}

function addRecord(discordUserName, walletAddress, discordUserId) {
  database("Whitelist").create(
    [
      {
        fields: {
          WhitelistedTime: new Date().toISOString(),
          DiscordUserName: discordUserName,
          WalletAddress: walletAddress,
          DiscordUserId: discordUserId,
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

const whitelist = async (interaction) => {
  await interaction.reply({ content: "Working on it...", ephemeral: true });
  if (interaction.member.roles.cache.some((role) => role.name === "Member")) {
    const discordUserName = interaction.user.username;
    const discordUserId = interaction.user.id;
    const walletAddress = interaction.options.getString("address");
    const discordUserIdAddresses = await getDiscordUserIdAddresses(
      discordUserId
    );
    //console.log(interaction);
    if (!discordUserIdAddresses || discordUserIdAddresses.length == 0) {
      try {
        // check if whitelist already has max members
        const totalAddresses = await countWalletAddresses();
        if (totalAddresses >= MAX_WHITELIST_MEMBERS) {
          await interaction.followUp({
            content:
              "The whitelist is full with 1,000 addresses. The community treasury will decide what to do with the remaining blank NFTs. Your participation matters!",
            ephemeral: true,
          });
        } else {
          addRecord(discordUserName, walletAddress, discordUserId);

          const content = `Wallet address ${walletAddress} added for member ${discordUserName}`;

          await interaction.followUp({
            content: content,
            ephemeral: true,
          });
        }
      } catch (error) {
        console.log(error);
        if (error.code && error.code == "INVALID_ARGUMENT") {
          var errorMessage =
            "Wallet address " +
            walletAddress +
            " invalid -- do you have a typo?";
        } else {
          var errorMessage = error.message;
        }
        await interaction.followUp({
          content: "Error: " + errorMessage,
          ephemeral: true,
        });
      }
    } else {
      await interaction.followUp({
        content:
          "Wallet address " +
          discordUserIdAddresses[0] +
          " already exists for member " +
          discordUserName +
          ". Please contact a member of our moderation team to handle this issue!",
        ephemeral: true,
      });
    }
  } else {
    await interaction.followUp({
      content:
        "You must be a member to add your wallet address to the whitelist. Apply in the #apply channel, we'd love to have you!",
      ephemeral: true,
    });
  }
};

export default whitelist;
