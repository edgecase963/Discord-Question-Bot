# Discord-Question-Bot

## Details
This bot is designed to answer redundant and frequently asked questions by students/users/members.
Simply designate an administrator for a Discord channel, and that admin can assign questions with answers using this bot.

Questions and answers will be automatically saved into a database. Once a user asks a saved question, the bot will reply with the respective answer. Simple!

## Usage
Set up the bot via Discord.
Once you have a Discord bot token, save that token to the `discord_bot_token.txt` file in the `keys` folder.

Add the admin's username into `admin_username.txt` file and use the following command to add a question/answer

```
/addquestion
question: What color is a sunflower?
answer: Yellow.
```
