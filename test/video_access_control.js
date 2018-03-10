const VideoAccessControl = artifacts.require("./VideoAccessControl.sol");

contract('VideoAccessControl', async (accounts) => {

  it("should add board members correctly", async () => {
    var account_two = accounts[1];
    var account_three = accounts[2];

    let videoAccessControlInstance = await VideoAccessControl.deployed();
    await videoAccessControlInstance.addBoardMember(account_two);
    await videoAccessControlInstance.addBoardMember(account_three);

    let boardMembers = await videoAccessControlInstance.getBoardMembers.call();

    assert.equal(account_two, boardMembers[0]);
    assert.equal(account_three, boardMembers[1]);
    assert.equal(2, boardMembers.length);
  });

  it("should not add an existing board member", async () => {
    var account_two = accounts[1];

    let videoAccessControlInstance = await VideoAccessControl.deployed();
    await videoAccessControlInstance.addBoardMember(account_two);

    let boardMembers = await videoAccessControlInstance.getBoardMembers.call();

    assert.equal(account_two, boardMembers[0]);
    assert.equal(2, boardMembers.length);
  });

  it("should disallow non owner to add board members", async () => {
    var account_two = accounts[1];
    var account_four = accounts[3];

    let videoAccessControlInstance = await VideoAccessControl.deployed();

    try {
      await videoAccessControlInstance.addBoardMember(account_four, {from: account_two});
      assert.fail("should have thrown before");
    } catch(error) {
      assert.isNotNull(error);
    }

    let boardMembers = await videoAccessControlInstance.getBoardMembers.call();

    assert.equal(2, boardMembers.length);
  });

  it("should allow board members to get all board members", async () => {
    var account_two = accounts[1];

    let videoAccessControlInstance = await VideoAccessControl.deployed();

    let boardMembers = await videoAccessControlInstance.getBoardMembers.call({from: account_two});

    assert.equal(account_two, boardMembers[0]);
    assert.equal(2, boardMembers.length);
  });

  it("should disallow non board members to get all board members", async () => {
    var account_four = accounts[3];

    let videoAccessControlInstance = await VideoAccessControl.deployed();

    try {
      let boardMembers = await videoAccessControlInstance.getBoardMembers.call({from: account_four});
      assert.fail("should have thrown before");
    } catch(error) {
      assert.isNotNull(error);
    }
  });

  it("should disallow non owner to remove board members", async () => {
    var account_two = accounts[1];

    let videoAccessControlInstance = await VideoAccessControl.deployed();

    try {
      await videoAccessControlInstance.removeBoardMember(account_two, {from: account_two});
      assert.fail("should have thrown before");
    } catch(error) {
      assert.isNotNull(error);
    }

    let boardMembers = await videoAccessControlInstance.getBoardMembers.call();

    assert.equal(2, boardMembers.length);
  });

  it("should not remove a non-existing board member", async () => {
    var account_four = accounts[3];

    let videoAccessControlInstance = await VideoAccessControl.deployed();
    await videoAccessControlInstance.removeBoardMember(account_four);

    let boardMembers = await videoAccessControlInstance.getBoardMembers.call();

    assert.equal(2, boardMembers.length);
  });

  it("should remove board members correctly", async () => {
    var account_two = accounts[1];
    var account_three = accounts[2];

    let videoAccessControlInstance = await VideoAccessControl.deployed();
    await videoAccessControlInstance.removeBoardMember(account_two);
    await videoAccessControlInstance.removeBoardMember(account_three);

    let boardMembers = await videoAccessControlInstance.getBoardMembers.call();

    assert.equal(2, boardMembers.length);
  });

});
