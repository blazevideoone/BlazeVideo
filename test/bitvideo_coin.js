const T1898Token = artifacts.require("./BitVideoCoin.sol");
const AssertJump = require("./assert_jump.js");

contract('BitVideoCoin', async (accounts) => {

  const TOKEN_NAME = 'BitVideo Coin';
  const TOKEN_SYMBOL = 'BTVC';
  const TOTAL_SUPPLY = 1000000000;
  const DECIMALS = 6;

  it("should token deployed correctly", async () => {
    const _token = await T1898Token.deployed();
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

  it("transfer function work correctly", async () => {
    const _token = await T1898Token.deployed();
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

  it("approve function work correctly", async () => {
    const _token = await T1898Token.deployed();
    const _sender = accounts[0];
    const _spender = accounts[2];
    const _result = await _token.approve(_spender, web3.toHex(10000), { from: _sender });
    const _event = _result.logs[0].event;
    const _allowance = await _token.allowance.call(_sender, _spender);
    assert.equal('Approval', _event);
    assert.equal(10000, _allowance);
  });

  it("transfer from function work correctly", async () => {
    const _token = await T1898Token.deployed();
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

  it("transfer owner function work correctly", async () => {
    const _token = await T1898Token.deployed();
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

  it("increase and decrease allowance function work correctly", async () => {
    const _token = await T1898Token.deployed();
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

  it("freeze account function work correctly", async () => {
    const _token = await T1898Token.deployed();
    const _owner = accounts[0];
    const _receiver = accounts[1];
    const _spender = accounts[2];
    try {
      await _token.freezeAccount(_owner, web3.toHex(10000), {from: _receiver});
      assert.fail("only owner could freeze account");
    } catch (error) {
      AssertJump(error);
    }
    // freeze all balance
    const _balance = await _token.balanceOf.call(_receiver);
    const _result = await _token.freezeAccount(_receiver, _balance, { from: _owner });
    const _event = _result.logs[0].event;
    const _frozen = await _token.frozenOf.call(_receiver);
    assert.equal('Frozen', _event);
    assert.equal(_balance.toNumber(), _frozen.toNumber());
    try {
      await _token.transfer(_spender, web3.toHex(1), {from: _receiver});
      assert.fail("account is frezzed");
    } catch (error) {
      AssertJump(error);
    }
    // freeze account with _balance - 1000
    await _token.freezeAccount(_receiver, _balance - 1000, { from: _owner });
    try {
      await _token.transfer(_spender, web3.toHex(2000), {from: _receiver});
      assert.fail("account is frezzed");
    } catch (error) {
      AssertJump(error);
    }
    await _token.transfer(_spender, web3.toHex(1000), { from: _receiver});
    const _newBalance = await _token.balanceOf.call(_receiver);
    assert.equal(_newBalance, _balance - 1000);
  });
});
