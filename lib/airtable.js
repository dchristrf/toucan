import { default as config } from "../config.js";

import Airtable from "airtable";

const applicationDatabase = new Airtable({ apiKey: config.airtableKey }).base(
  config.airtableId
);

/** Fields is an object with keys that must match existing field names in Airtable  */
function addRecord(tableName, fields) {
  applicationDatabase(tableName).create([{ fields }], function (err, _records) {
    if (err) {
      console.error(err);
      return;
    }
  });
}

function updateRecord(tableName, recId, fields) {
  applicationDatabase(tableName).update(
    [{ id: recId, fields }],
    function (err, _records) {
      if (err) {
        console.error(err);
        return;
      }
    }
  );
}

async function getPendingApplications() {
  const matchingRecords = [];
  await applicationDatabase("Applications")
    .select({
      filterByFormula: `({Approved} = 0)`,
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
  console.log({ matchingRecords });
  return matchingRecords;
}

/** Filter ex: { DiscordUserId: discordUserId } */
async function getRecordsBySingleFilter(tableName, field, val) {
  const matchingRecords = [];
  await applicationDatabase(tableName)
    .select({
      filterByFormula: `({${field}} = '${val}')`,
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

export {
  applicationDatabase,
  getRecordsBySingleFilter,
  addRecord,
  updateRecord,
  getPendingApplications,
};
