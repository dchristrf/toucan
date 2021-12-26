const whoami = async (interaction) => {
  const botResponse = `Hello! I'm Toucan. 
  
I help review member applications and also help members whitelist their wallet addresses for minting. 

I also like playing ping pong!`;

  await interaction.reply({ content: botResponse, ephemeral: true });
};

export default whoami;
