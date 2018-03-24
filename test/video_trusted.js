const VideoTrusted = artifacts.require("./VideoTrusted.sol");
const AssertJump = require("./assert_jump.js");

contract('VideoTrusted', async (accounts) => {

  it("should add trusted contracts correctly", async () => {
    var account_two = accounts[1];
    var account_three = accounts[2];

    let videoTrustedInstance = await VideoTrusted.deployed();
    await videoTrustedInstance.addTrustedContract(account_two);
    await videoTrustedInstance.addTrustedContract(account_three);

    let trustedContracts = await videoTrustedInstance.getTrustedContracts.call();

    assert.equal(account_two, trustedContracts[0]);
    assert.equal(account_three, trustedContracts[1]);
    assert.equal(2, trustedContracts.length);
  });

  it("should not add an existing trusted contract", async () => {
    var account_two = accounts[1];

    let videoTrustedInstance = await VideoTrusted.deployed();
    await videoTrustedInstance.addTrustedContract(account_two);

    let trustedContracts = await videoTrustedInstance.getTrustedContracts.call();

    assert.equal(account_two, trustedContracts[0]);
    assert.equal(2, trustedContracts.length);
  });

  it("should disallow non owner to add trusted contracts", async () => {
    var account_two = accounts[1];
    var account_four = accounts[3];

    let videoTrustedInstance = await VideoTrusted.deployed();

    try {
      await videoTrustedInstance.addTrustedContract(account_four, {from: account_two});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    let trustedContracts = await videoTrustedInstance.getTrustedContracts.call();

    assert.equal(2, trustedContracts.length);
  });

  it("should allow trusted contracts to get all trusted contracts", async () => {
    var account_two = accounts[1];

    let videoTrustedInstance = await VideoTrusted.deployed();

    let trustedContracts = await videoTrustedInstance.getTrustedContracts.call({from: account_two});

    assert.equal(account_two, trustedContracts[0]);
    assert.equal(2, trustedContracts.length);
  });

  it("should disallow non trusted contracts to get all trusted contracts", async () => {
    var account_four = accounts[3];

    let videoTrustedInstance = await VideoTrusted.deployed();

    try {
      let trustedContracts = await videoTrustedInstance.getTrustedContracts.call({from: account_four});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should disallow non trusted contracts to get all trusted contracts", async () => {
    var account_four = accounts[3];

    let videoTrustedInstance = await VideoTrusted.deployed();

    try {
      let trustedContracts = await videoTrustedInstance.getTrustedContracts.call({from: account_four});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should disallow non owner to remove trusted contracts", async () => {
    var account_two = accounts[1];

    let videoTrustedInstance = await VideoTrusted.deployed();

    try {
      await videoTrustedInstance.removeTrustedContract(account_two, {from: account_two});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    let trustedContracts = await videoTrustedInstance.getTrustedContracts.call();

    assert.equal(2, trustedContracts.length);
  });

  it("should not remove a non-existing trusted contract", async () => {
    var account_four = accounts[3];

    let videoTrustedInstance = await VideoTrusted.deployed();
    await videoTrustedInstance.removeTrustedContract(account_four);

    let trustedContracts = await videoTrustedInstance.getTrustedContracts.call();

    assert.equal(2, trustedContracts.length);
  });

  it("should remove trusted contracts correctly", async () => {
    var account_two = accounts[1];
    var account_three = accounts[2];

    let videoTrustedInstance = await VideoTrusted.deployed();
    await videoTrustedInstance.removeTrustedContract(account_two);
    await videoTrustedInstance.removeTrustedContract(account_three);

    let trustedContracts = await videoTrustedInstance.getTrustedContracts.call();

    assert.equal(2, trustedContracts.length);
  });

});
