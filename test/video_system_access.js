const VideoSystemAccess = artifacts.require("./VideoSystemAccess.sol");
const AssertJump = require("./assert_jump.js");

contract('VideoSystemAccess', async (accounts) => {
  let videoSystemAccessInstance;

  it("should add system accounts correctly", async () => {
    videoSystemAccessInstance = await VideoSystemAccess.new();

    var account_two = accounts[1];
    var account_three = accounts[2];

    await videoSystemAccessInstance.addSystemAccount(account_two);
    await videoSystemAccessInstance.addSystemAccount(account_three);

    let systemAccounts = await videoSystemAccessInstance.getSystemAccounts.call();

    assert.equal(account_two, systemAccounts[0]);
    assert.equal(account_three, systemAccounts[1]);
    assert.equal(2, systemAccounts.length);
  });

  it("should not add an existing system account", async () => {
    var account_two = accounts[1];

    await videoSystemAccessInstance.addSystemAccount(account_two);

    let systemAccounts = await videoSystemAccessInstance.getSystemAccounts.call();

    assert.equal(account_two, systemAccounts[0]);
    assert.equal(2, systemAccounts.length);
  });

  it("should disallow non owner to add system accounts", async () => {
    var account_two = accounts[1];
    var account_four = accounts[3];

    try {
      await videoSystemAccessInstance.addSystemAccount(account_four, {from: account_two});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    let systemAccounts = await videoSystemAccessInstance.getSystemAccounts.call();

    assert.equal(2, systemAccounts.length);
  });

  it("should allow system accounts to get all system accounts", async () => {
    var account_two = accounts[1];

    let systemAccounts = await videoSystemAccessInstance.getSystemAccounts.call({from: account_two});

    assert.equal(account_two, systemAccounts[0]);
    assert.equal(2, systemAccounts.length);
  });

  it("should disallow non system accounts to get all system accounts", async () => {
    var account_four = accounts[3];

    try {
      let systemAccounts = await videoSystemAccessInstance.getSystemAccounts.call({from: account_four});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should disallow non owner to remove system accounts", async () => {
    var account_two = accounts[1];

    try {
      await videoSystemAccessInstance.removeSystemAccount(account_two, {from: account_two});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    let systemAccounts = await videoSystemAccessInstance.getSystemAccounts.call();

    assert.equal(2, systemAccounts.length);
  });

  it("should not remove a non-existing system account", async () => {
    var account_four = accounts[3];

    await videoSystemAccessInstance.removeSystemAccount(account_four);

    let systemAccounts = await videoSystemAccessInstance.getSystemAccounts.call();

    assert.equal(2, systemAccounts.length);
  });

  it("should remove system accounts correctly", async () => {
    var account_two = accounts[1];
    var account_three = accounts[2];

    await videoSystemAccessInstance.removeSystemAccount(account_two);
    await videoSystemAccessInstance.removeSystemAccount(account_three);

    let systemAccounts = await videoSystemAccessInstance.getSystemAccounts.call();

    assert.equal(2, systemAccounts.length);
  });

});
