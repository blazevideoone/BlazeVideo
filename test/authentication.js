// Test for Authentication
// SPC 2018/3/28
const Authentication = artifacts.require("./Authentication.sol");
const AssertJump = require("./assert_jump.js");

contract('Authentication', async (accounts) => {

  const NICKNAME = 'testuser';
  const NICKNAME2 = 'testuser2';
  const BADNAME = 0x0;

  it("should not login non-existing account.", async () => {
    let authInstance = await Authentication.deployed();
    try {
      await authInstance.login.call();
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should sign up and log in a user.", async () => {
    let authInstance = await Authentication.deployed();
    await authInstance.signup(NICKNAME, {from: accounts[0]});
    const nickName = await authInstance.login.call();
    assert.equal(web3.toUtf8(nickName), 'testuser', "The user was not signed up.");
  });

  it("should log in a user and update the nickname.", async () => {
    let authInstance = await Authentication.deployed();
    await authInstance.login.call();
    await authInstance.update(NICKNAME2, {from: accounts[0]});
    const nickName = await authInstance.login.call();
    assert.equal(web3.toUtf8(nickName), 'testuser2', "The user nickname was not updated.");
  });

  it("should get the nickname", async () => {
    let authInstance = await Authentication.deployed();
    const nickName = await authInstance.getUserName.call(accounts[0]);
    assert.equal(web3.toUtf8(nickName), 'testuser2', "Cannot get nickname.");
  });

  it("should not signup twice.", async () => {
    let authInstance = await Authentication.deployed();
    try {
      await authInstance.signup(NICKNAME, {from: accounts[0]});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should not update non-valid name.", async () => {
    let authInstance = await Authentication.deployed();
    try {
      await authInstance.update(BADNAME, {from: accounts[0]});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

});
