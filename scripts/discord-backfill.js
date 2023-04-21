require("dotenv").config();
const Discord = require("discord.js");
const fs = require("fs");

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = "the-wall-digital-collectors-edition";
const BEFORE_DATE = "2023-03-25T00:00:00.000Z"; // the launch of the new bot, so we don't get any duplicates

const client = new Discord.Client();
const channel = client.channels.cache.get(CHANNEL_ID);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Authenticate the client and fetch messages in batches
client.login(TOKEN).then(() => {
  const messages = [];
  fetchMessages(null);

  function fetchMessages(before) {
    channel.messages
      .fetch({
        limit: 100,
        before: before,
      })
      .then((fetchedMessages) => {
        const messagesBeforeDate = fetchedMessages.filter((message) => {
          return message.createdAt < new Date(BEFORE_DATE);
        });
        messages.push(...messagesBeforeDate.array());

        if (fetchedMessages.size === 100) {
          fetchMessages(fetchedMessages.last().id);
        } else {
          console.log(
            `Fetched ${messages.length} messages before ${BEFORE_DATE}`
          );
          client.destroy();
          saveMessagesToFile(messages);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

// Save the fetched messages to a file
function saveMessagesToFile(messages) {
  const data = messages.map((message) => {
    return {
      id: message.id,
      content: message.content,
      author: message.author.username,
      createdAt: message.createdAt,
    };
  });
  fs.writeFile("messages.json", JSON.stringify(data), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Messages saved to file");
  });
}
