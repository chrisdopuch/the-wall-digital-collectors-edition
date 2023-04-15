function main(params, logger = console) {
  const results = { errors: [], exception: null };

  try {
    const inputMessage = params.content;
    const mentionsUsername = params.mentions_username
      ? params.mentions_username.split(",")
      : [];
    const mentionsId = params.mentions_id ? params.mentions_id.split(",") : [];
    const now = new Date();
    const uuid = `${now.getTime()}-${Math.floor(Math.random() * 1000000)}`;
    results.uuid = uuid;
    const date = now.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    results.date = date;
    const regex =
      /Game:\s*(.*?)\s+Competitors:\s*((?:<@\d+>|[a-zA-Z0-9-. ]+)(?:\s*,\s*(?:<@\d+>|[a-zA-Z0-9-. ]+))*)(?:\s+Winners?:\s*((?:<@\d+>|[a-zA-Z0-9-. ]+)(?:\s*,\s*(?:<@\d+>|[a-zA-Z0-9-. ]+))*))?/;

    const matches = inputMessage.match(regex);

    if (!matches) {
      results.errors.push("Failed to match input message");
    } else {
      const gameName = matches[1];
      if (!matches[2] || matches[2].length < 1) {
        throw new Error("No competitors were found");
      }
      logger.log("MATCHES: ", matches[2]);
      let competitors = matches[2].split(/,\s+| and\s+/);
      if (!matches[3] || matches[3].length < 1) {
        throw new Error("No winners were found");
      }
      const winners = matches[3].split(/,\s+| and\s+/);

      // Replace mention IDs with usernames
      for (let i = 0; i < competitors.length; i++) {
        const competitor = competitors[i].trim();
        if (competitor.startsWith("<@") && competitor.endsWith(">")) {
          const id = competitor.substring(2, competitor.length - 1);
          const index = mentionsId.indexOf(id);
          if (index >= 0) {
            competitors[i] = `@${mentionsUsername[index]}`;
          }
        }
      }
      for (let i = 0; i < winners.length; i++) {
        const winner = winners[i].trim();
        if (winner.startsWith("<@") && winner.endsWith(">")) {
          const id = winner.substring(2, winner.length - 1);
          const index = mentionsId.indexOf(id);
          if (index >= 0) {
            winners[i] = `@${mentionsUsername[index]}`;
          }
        }
      }

      results.winners = winners;
      results.gameName = gameName;
      results.competitors = competitors;
    }
  } catch (error) {
    logger.log(error);
    results.errors.push("Failed to parse input message");
    results.exception = error.toString();
  }

  return results;
}

// For testing in NodeJS
if (typeof module !== "undefined") {
  module.exports = { main };
}

// For running in Zapier
if (typeof inputData !== "undefined") {
  return main(inputData);
}
