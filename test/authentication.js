// Test for Authentication
// SPC 2018/3/28
const Authentication = artifacts.require("./Authentication.sol");

contract('Authentication', async (accounts) => {

  const NICKNAME = 'testuser';
  const NICKNAME2 = 'testuser2';

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

});
