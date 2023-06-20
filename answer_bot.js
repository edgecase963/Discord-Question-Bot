const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');
const { v4: uuidv4 } = require('uuid');

// Read the primary admin from the 'admin_username.txt' file
const ADMIN_USERNAME = fs.readFileSync('admin_username.txt', 'utf8').trim();

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

  if (message.author.username === ADMIN_USERNAME) {
      // If the message is from the admin, process the command
      const command = message.content.trim();
      if (command.startsWith('/addquestion')) {
        const match = command.match(/addquestion\nquestion: (.+)\nanswer: (.+)/i);
        try {
            if (match) {
                const [, questionText, answerText] = match;
                // run addQuestion function
                const questionId = await addQuestion(questionText, answerText);
                message.channel.send('Question and answer added successfully!');
            } else {
                message.channel.send('Invalid format. Please use the following format:\n\n/addquestion\nquestion: [Question Text]\nanswer: [Answer Text]');
            }
        } catch (error) {
            console.error('Error occurred during command processing:', error);
            message.channel.send('An error occurred while processing the command. Please try again.');
        }
    } else {
      await searchQuestion(message, message.content);
    };
  } else {
      // Otherwise, send a response from ChatGPT
      await searchQuestion(message, message.content);
  }
});

// Function to find the answer to a question
async function searchQuestion(message, userQuestion) {
  try {
    const questionFiles = await fs.promises.readdir('question_db');
    for (const questionFile of questionFiles) {
      const filePath = `question_db/${questionFile}`;
      const questionData = await fs.promises.readFile(filePath, 'utf8');
      const question = JSON.parse(questionData);

      // Remove question mark, spaces, and punctuation
      const formattedQuestion = question.question.replace(/[? ]/g, '').replace(/[^a-zA-Z]/g, '');
      const formattedUserQuestion = userQuestion.replace(/[? ]/g, '').replace(/[^a-zA-Z]/g, '');

      if (formattedQuestion.toLowerCase() === formattedUserQuestion.toLowerCase()) {
        // Found a matching question, send the answer to the channel and mention the user
        message.reply(`@${message.author.username}, ${question.answer}`);
        return; // Exit the function after sending the answer
      }
    }
    // No matching question found
    //message.channel.send('I am sorry, but I do not have an answer to that question.');
  } catch (error) {
    console.error('Failed to read question database:', error);
  }
}

// Function to add question and answer to the 'question_db' folder
async function addQuestion(questionText, answerText) {
  // Create a new question object
  const question = {
      question: questionText,
      answer: answerText,
  };

  // Write the question object to a JSON file
  const questionId = uuidv4();
  const questionPath = `question_db/${questionId}.json`;
  await fs.promises.writeFile(questionPath, JSON.stringify(question, null, 2));

  // Return the question ID
  return questionId;
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
