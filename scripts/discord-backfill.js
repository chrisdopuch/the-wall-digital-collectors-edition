require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = "673050858883252245";
const BEFORE_DATE = "2023-03-25T00:00:00.000Z"; // the launch of the new bot, so we don't get any duplicates

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  const channel = client.channels.cache.get(CHANNEL_ID);
  const messages = [];
  fetchMessages(channel, null);

  function fetchMessages(channel, before) {
    channel.messages
      .fetch({
        limit: 100,
        before: before,
      })
      .then((fetchedMessages) => {
        const messagesBeforeDate = fetchedMessages.filter((message) => {
          return new Date(message.createdTimestamp) < new Date(BEFORE_DATE);
        });
        messages.push(...messagesBeforeDate);

        if (fetchedMessages.size === 100) {
          fetchMessages(channel, fetchedMessages.last().id);
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

// Authenticate the client and fetch messages in batches
client.login(TOKEN);

// Save the fetched messages to a file
function saveMessagesToFile(messages) {
  const data = messages.map(([_, message]) => {
    const { id, content, author, createdAt } = message;
    const users = message.mentions.users.map((user) => ({
      username: user.username,
      id: user.id,
    }));
    return {
      id: id,
      content: content,
      author: author.username,
      createdAt: createdAt,
      users: users,
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
