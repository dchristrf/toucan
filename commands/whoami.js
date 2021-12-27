import { default as config } from "../config.js";

const whoami = async (interaction) => {
  const botResponse = `Hello! I'm Toucan. 
  
I help review member applications. Once an application receives the minimum threshold of member votes and approval from at least one RainCouncil member, I grant them a RainMaker role! 

I also like playing ping pong!`;

  await interaction.reply({ content: botResponse, ephemeral: true });
};

export default whoami;
