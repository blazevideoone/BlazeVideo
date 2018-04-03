const VideoAccessControl = artifacts.require("./VideoAccessControl.sol");
const AssertJump = require("./assert_jump.js");


contract('VideoAccessControl', async (accounts) => {
  let videoAccessControlInstance;

  it("should add board members correctly", async () => {
    videoAccessControlInstance = await VideoAccessControl.new();
    var account_two = accounts[1];
    var account_three = accounts[2];

    await videoAccessControlInstance.addBoardMember(account_two);
    await videoAccessControlInstance.addBoardMember(account_three);

    let boardMembers = await videoAccessControlInstance.getBoardMembers.call();

    assert.equal(account_two, boardMembers[0]);
    assert.equal(account_three, boardMembers[1]);
    assert.equal(2, boardMembers.length);
  });

  it("should not add an existing board member", async () => {
    var account_two = accounts[1];

    await videoAccessControlInstance.addBoardMember(account_two);

    let boardMembers = await videoAccessControlInstance.getBoardMembers.call();

    assert.equal(account_two, boardMembers[0]);
    assert.equal(2, boardMembers.length);
  });

  it("should disallow non owner to add board members", async () => {
    var account_two = accounts[1];
    var account_four = accounts[3];

    try {
      await videoAccessControlInstance.addBoardMember(account_four, {from: account_two});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    let boardMembers = await videoAccessControlInstance.getBoardMembers.call();

    assert.equal(2, boardMembers.length);
  });

  it("should allow board members to get all board members", async () => {
    var account_two = accounts[1];

    let boardMembers = await videoAccessControlInstance.getBoardMembers.call({from: account_two});

    assert.equal(account_two, boardMembers[0]);
    assert.equal(2, boardMembers.length);
  });

  it("should disallow non board members to get all board members", async () => {
    var account_four = accounts[3];

    try {
      let boardMembers = await videoAccessControlInstance.getBoardMembers.call({from: account_four});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should allow board members to pause and all accounts to check isPaused", async () => {
    var account_two = accounts[1];
    var account_four = accounts[3];

    await videoAccessControlInstance.pause({from: account_two});

    let paused = await videoAccessControlInstance.isPaused.call({from: account_four});

    assert.equal(true, paused);
  });

  it("should disallow board members to unpause except owner", async () => {
    var account_two = accounts[1];
    var account_four = accounts[3];

    try {
      await videoAccessControlInstance.unpause({from: account_two});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    // From owner
    await videoAccessControlInstance.unpause();

    let paused = await videoAccessControlInstance.isPaused.call({from: account_four});

    assert.equal(false, paused);
  });

  it("should disallow non board members to get all board members", async () => {
    var account_four = accounts[3];

    try {
      let boardMembers = await videoAccessControlInstance.getBoardMembers.call({from: account_four});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should disallow non owner to remove board members", async () => {
    var account_two = accounts[1];

    try {
      await videoAccessControlInstance.removeBoardMember(account_two, {from: account_two});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    let boardMembers = await videoAccessControlInstance.getBoardMembers.call();

    assert.equal(2, boardMembers.length);
  });

  it("should not remove a non-existing board member", async () => {
    var account_four = accounts[3];

    await videoAccessControlInstance.removeBoardMember(account_four);

    let boardMembers = await videoAccessControlInstance.getBoardMembers.call();

    assert.equal(2, boardMembers.length);
  });

  it("should remove board members correctly", async () => {
    var account_two = accounts[1];
    var account_three = accounts[2];

    await videoAccessControlInstance.removeBoardMember(account_two);
    await videoAccessControlInstance.removeBoardMember(account_three);

    let boardMembers = await videoAccessControlInstance.getBoardMembers.call();

    assert.equal(2, boardMembers.length);
  });

});
