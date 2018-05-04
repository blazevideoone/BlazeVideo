const BitVideoCoin = artifacts.require("./BitVideoCoin.sol");
const AssertJump = require("./assert_jump.js");

contract('BitVideoCoin', async (accounts) => {

  const TOKEN_NAME = 'BitVideo Coin';
  const TOKEN_SYMBOL = 'BTVC';
  const TOTAL_SUPPLY = 1000000000;
  const DECIMALS = 6;

  // test contract deploying
  it("should token deployed correctly", async () => {
    const _token = await BitVideoCoin.deployed();
    // totalSupply
    const _totalSupply = await _token.totalSupply.call();
    assert.equal(TOTAL_SUPPLY, _totalSupply);
    // tokenName
    const _tokenName = await _token.name.call();
    assert.equal(TOKEN_NAME, _tokenName);
    // tokenSymbol
    const _totalSymbol = await _token.symbol.call();
    assert.equal(TOKEN_SYMBOL, _totalSymbol);
    // decimals
    const _decimals = await _token.decimals.call();
    assert.equal(DECIMALS, _decimals);
    // owner
    const _creator = accounts[0];
    const _owner = await _token.owner.call();
    assert.equal(_creator, _owner);
  });

  // test transfer function
  it("transfer function work correctly", async () => {
    const _token = await BitVideoCoin.deployed();
    const _sender = accounts[0];
    const _receiver = accounts[1];
    const _balanceS = await _token.balanceOf.call(_sender);
    const _balanceR = await _token.balanceOf.call(_receiver);
    const _result = await _token.transfer(_receiver, web3.toHex(10000), { from: _sender });
    const _event = _result.logs[0].event;
    const _newBalanceS = await _token.balanceOf.call(_sender);
    const _newBalanceR = await _token.balanceOf.call(_receiver);
    assert.equal('Transfer', _event);
    assert.equal(10000, _balanceS - _newBalanceS);
    assert.equal(10000, _newBalanceR - _balanceR);
    try {
      await _token.transfer(_sender, web3.toHex(20000), {from: _receiver});
      assert.fail("should not transfer more than balance");
    } catch (error) {
      AssertJump(error);
    }
  });

  // test approve function
  it("approve function work correctly", async () => {
    const _token = await BitVideoCoin.deployed();
    const _sender = accounts[0];
    const _spender = accounts[2];
    const _result = await _token.approve(_spender, web3.toHex(10000), { from: _sender });
    const _event = _result.logs[0].event;
    const _allowance = await _token.allowance.call(_sender, _spender);
    assert.equal('Approval', _event);
    assert.equal(10000, _allowance);
  });

  // test transferFrom function
  it("transfer from function work correctly", async () => {
    const _token = await BitVideoCoin.deployed();
    const _sender = accounts[0];
    const _receiver = accounts[1];
    const _spender = accounts[2];
    await _token.approve(_spender, web3.toHex(10000), { from: _sender });
    const _balanceS = await _token.balanceOf.call(_sender);
    const _balanceR = await _token.balanceOf.call(_receiver);
    const _result = await _token.transferFrom(_sender, _receiver, web3.toHex(5000), { from: _spender });
    const _event = _result.logs[0].event;
    const _newBalanceS = await _token.balanceOf.call(_sender);
    const _newBalanceR = await _token.balanceOf.call(_receiver);
    assert.equal('Transfer', _event);
    assert.equal(5000, _balanceS - _newBalanceS);
    assert.equal(5000, _newBalanceR - _balanceR);
    try {
      await _token.transferFrom(_sender, _receiver, web3.toHex(10000), {from: _spender});
      assert.fail("should not transfer from more than allowance");
    } catch (error) {
      AssertJump(error);
    }
  });

  // test transfer ownership
  it("transfer owner function work correctly", async () => {
    const _token = await BitVideoCoin.deployed();
    const _owner = accounts[0];
    const _newOwner = accounts[1];
    try {
      await _token.transferOwnership(_owner, {from: _newOwner});
      assert.fail("only owner could transfer ownership");
    } catch (error) {
      AssertJump(error);
    }
    const _result = await _token.transferOwnership(_newOwner, {from: _owner});
    const _event = _result.logs[0].event;
    assert.equal('OwnershipTransferred', _event);
    const _currentOwner = await _token.owner.call();
    assert.equal(_currentOwner, _newOwner);
    await _token.transferOwnership(_owner, {from: _newOwner});
  });

  // test increase and decrease allownance
  it("increase and decrease allowance function work correctly", async () => {
    const _token = await BitVideoCoin.deployed();
    const _sender = accounts[0];
    const _spender = accounts[2];
    // init allowance is 10000
    await _token.approve(_spender, 10000, {from: _sender});
    // increase 10000 to 20000
    let _result = await _token.increaseApproval(_spender, 10000, {from: _sender});
    let _event = _result.logs[0].event;
    assert.equal('Approval', _event);
    let _allowance = await _token.allowance.call(_sender, _spender);
    assert.equal(_allowance, 20000);
    // decrease 10000 to 10000
    _result = await _token.decreaseApproval(_spender, 10000, {from: _sender});
    _event = _result.logs[0].event;
    assert.equal('Approval', _event);
    _allowance = await _token.allowance.call(_sender, _spender);
    assert.equal(_allowance, 10000);
    // decrease more than allowance should set allowance to 0
    _result = await _token.decreaseApproval(_spender, 20000, {from: _sender});
    _event = _result.logs[0].event;
    assert.equal('Approval', _event);
    _allowance = await _token.allowance.call(_sender, _spender);
    assert.equal(_allowance, 0);
  });

  // test mint
  it("mint function work correctly", async () => {
    const _token = await BitVideoCoin.deployed();
    const _issuer = accounts[0];
    const _fakeIssuer = accounts[1];
    const _receiver = accounts[2];
    const _totalSupply = await _token.totalSupply.call();
    const _balance = await _token.balanceOf.call(_receiver);
    // normal burn
    const _result = await _token.mint(_receiver, 10000, {from: _issuer});
    const _event = _result.logs[0].event;
    const _newBalance = await _token.balanceOf.call(_receiver);
    const _newTotalSupply = await _token.totalSupply.call();
    assert.equal(_newBalance, _balance + 10000);
    assert.equal(_newTotalSupply, _totalSupply + 10000);
    assert.equal('Mint', _event);
    // over burn
    try {
      await _token.mint(_receiver, 10000, {from: _fakeIssuer});
      assert.fail("only trusted account can mint");
    } catch (error) {
      AssertJump(error);
    }
  });

  // test burn
  it("burn function work correctly", async () => {
    const _token = await BitVideoCoin.deployed();
    const _acc1 = accounts[0];
    const _acc2 = accounts[1];
    const _totalSupply = await _token.totalSupply.call();
    const _balance1 = await _token.balanceOf.call(_acc1);
    const _balance2 = await _token.balanceOf.call(_acc2);
    // normal burn
    const _result = await _token.burn(10000, {from: _acc1});
    const _event = _result.logs[0].event;
    const _newBalance1 = await _token.balanceOf.call(_acc1);
    const _newTotalSupply = await _token.totalSupply.call();
    assert.equal(_newBalance1, _balance1 - 10000);
    assert.equal(_newTotalSupply, _totalSupply - 10000);
    assert.equal('Burn', _event);
    // over burn
    try {
      await _token.burn(_balance2 + 10000, {from: _acc2});
      assert.fail("should not burn more than balance");
    } catch (error) {
      AssertJump(error);
    }
  });
});
