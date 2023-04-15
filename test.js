const { main } = require("./main");
const { expect } = require("chai");

// stub out console logger
const logger = {
  log: () => {},
};

describe("Testing main function", function () {
  it("should parse game name, competitors and winners from the input", function () {
    const input = {
      content: "Game: Test\nCompetitors: A, B, C\nWinners: B",
      mentions_username: "user1,user2,user3",
      mentions_id: "1234,5678,9101",
    };

    const output = main(input, logger);

    expect(output).to.deep.equal({
      uuid: output.uuid,
      date: output.date,
      errors: [],
      exception: null,
      competitors: ["A", "B", "C"],
      gameName: "Test",
      winners: ["B"],
    });
  });

  it("should return an error if it fails to parse", function () {
    const input = {
      content: "Game: Test\nCompetitors:",
      mentions_username: "user1,user2,user3",
      mentions_id: "1234,5678,9101",
    };

    const output = main(input, logger);

    expect(output.errors).to.contain("Failed to match input message");
  });

  it("should return an error if it fails to find the winner(s)", function () {
    const input = {
      content: "Game: Test\nCompetitors: A, B, C, Winner:",
      mentions_username: "user1,user2,user3",
      mentions_id: "1234,5678,9101",
    };

    const output = main(input, logger);

    expect(output.errors).to.contain("Failed to parse input message");
    expect(output.exception).to.contain("No winners were found");
  });
});
