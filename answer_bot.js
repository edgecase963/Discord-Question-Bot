const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');
const { Configuration, OpenAIApi } = require("openai");
const axios = require('axios');

// Read the API key from the local file in the 'keys' folder
const OPENAI_API_KEY = fs.readFileSync('keys/api_key_test.txt', 'utf8').trim();

const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

// Create a new Discord client with intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ]
});

// Event: When the bot is ready and connected to Discord
client.once('ready', () => {
    console.log('Bot is ready');
    console.log(`Logged in as ${client.user.tag}`);
  });

// Event: When the bot receives a message
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore messages from other bots
  
    console.log('New message:');
    console.log(message.content); // Update to access message content directly
  
    if (message.channel.name === 'general' && message.content.toLowerCase() === 'hello, how are you?') {
        // Call the ChatGPT API
        const response = await getChatGPTResponse('Hello, how are you?');

        // Send the response to the Discord channel
        message.channel.send(response);
    }
  });

// Function to fetch response from ChatGPT API
async function getChatGPTResponse(prompt) {
  try {
    // Call the OpenAI API
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        maxTokens: 150,
        temperature: 0,
      });
    
    console.log(response.data.choices[0].text);

    // Return the response
    return response.data.choices[0].text;
  } catch (error) {
    console.error('Failed to fetch ChatGPT response:', error.message);
    return 'Oops! An error occurred while fetching the response.';
  }
}

// Read the Discord bot token from a local file
fs.readFile('keys/discord_bot_token.txt', 'utf8', (err, token) => {
  if (err) {
    console.error('Failed to read Discord bot token:', err);
    return;
  }

  // Login to Discord with the bot token
  client.login(token.trim());
});
