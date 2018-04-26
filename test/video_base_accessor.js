const MockVideoBase = artifacts.require("./MockVideoBase.sol");
const MockVideoBaseAccessor = artifacts.require("./MockVideoBaseAccessor.sol");
const AssertJump = require("./assert_jump.js");

contract('VideoBaseAccessor', function(accounts) {
  const VALID_TOKEN_ID = 0x1;
  const INVALID_TOKEN_ID = 0x2;
  const YOUTUBE_PREFIX = "YUTB_";
  const VALID_VIDEO_ID = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6viIBmU");
  const INVALID_VIDEO_ID = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6viIBmV");

  var mockVideoBaseAccessor;
  var mockVideoBase;

  it("should set VideoBase correctly", async () => {
    mockVideoBase = await MockVideoBase.new();
    mockVideoBaseAccessor = await MockVideoBaseAccessor.new();

    await mockVideoBase.mockSetSupportsVideoBase(false);
    try {
      await mockVideoBaseAccessor.setVideoBase(mockVideoBase.address);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    await mockVideoBase.mockSetSupportsVideoBase(true);

    await mockVideoBaseAccessor.setVideoBase(mockVideoBase.address);
    assert.equal(mockVideoBase.address,
                 await mockVideoBaseAccessor.getVideoBase.call());

    await mockVideoBaseAccessor.resetVideoBase();
    assert.equal(0x0, await mockVideoBaseAccessor.getVideoBase.call());
    try {
      await mockVideoBaseAccessor.resetVideoBase();
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should set VideoBase only for VideoBase contract owner", async () => {
    let accountContractOwner = accounts[1];
    await mockVideoBase.transferOwnership(accountContractOwner);

    try {
      await mockVideoBaseAccessor.setVideoBase(mockVideoBase.address);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    assert.equal(0x0, await mockVideoBaseAccessor.getVideoBase());

    await mockVideoBaseAccessor.setVideoBase(mockVideoBase.address,
                                             {from: accountContractOwner});
    try {
      await mockVideoBaseAccessor.getVideoBase.call();
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    assert.equal(mockVideoBase.address,
                 await mockVideoBaseAccessor.getVideoBase.call(
                    {from: accountContractOwner}));

    try {
      await mockVideoBaseAccessor.resetVideoBase();
      assert.fail("should have thrown before");
    } catch(error) {
     AssertJump(error);
    }
    await mockVideoBaseAccessor.resetVideoBase({from: accountContractOwner});
    assert.equal(0x0, await mockVideoBaseAccessor.getVideoBase.call());

    await mockVideoBase.transferOwnership(accounts[0],
                                          {from: accountContractOwner});
  });

  it("should not set VideoBase when current is not empty", async () => {
    let accountContractOwner = accounts[0];

    await mockVideoBaseAccessor.setVideoBase(mockVideoBase.address,
                                             {from: accountContractOwner});

    assert.equal(mockVideoBase.address,
                 await mockVideoBaseAccessor.getVideoBase.call(
                    {from: accountContractOwner}));

    let mockVideoBase2 = await MockVideoBase.new();
    await mockVideoBase2.mockSetSupportsVideoBase(true);

    try {
      await mockVideoBaseAccessor.setVideoBase(mockVideoBase2.address);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    assert.equal(mockVideoBase.address,
                 await mockVideoBaseAccessor.getVideoBase.call(
                    {from: accountContractOwner}));

    await mockVideoBaseAccessor.resetVideoBase({from: accountContractOwner});
  });

  it("should test modifiers when videoBase is set", async () => {
    let accountContractOwner = accounts[0];
    let accountTokenOwner = accounts[1];
    let accountBoardMember = accounts[2];
    let accountSystem = accounts[3];
    await mockVideoBase.mockSetValidTokenId(accountTokenOwner, VALID_TOKEN_ID);
    await mockVideoBase.mockSetValidVideoId(VALID_VIDEO_ID);
    await mockVideoBase.addBoardMember(accountBoardMember);
    await mockVideoBase.addSystemAccount(accountSystem);
    await mockVideoBaseAccessor.setVideoBase(mockVideoBase.address);

    assert.isTrue(await mockVideoBaseAccessor.funcWithOnlyVideoBaseTokenOwnerOf.call(
        VALID_TOKEN_ID, {from: accountTokenOwner}));
    try {
      await mockVideoBaseAccessor.funcWithOnlyVideoBaseTokenOwnerOf.call(
          VALID_TOKEN_ID, {from: accountContractOwner});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    try {
      await mockVideoBaseAccessor.funcWithOnlyVideoBaseTokenOwnerOf.call(
          INVALID_TOKEN_ID, {from: accountTokenOwner});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    await mockVideoBase.pause();
    try {
      await mockVideoBaseAccessor.funcWithWhenVideoBaseNotPaused.call();
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    await mockVideoBase.unpause();
    assert.isTrue(await mockVideoBaseAccessor.funcWithWhenVideoBaseNotPaused.call());

    assert.isTrue(await mockVideoBaseAccessor.funcWithOnlyVideoBaseBoardMembers.call(
        {from: accountContractOwner}));
    assert.isTrue(await mockVideoBaseAccessor.funcWithOnlyVideoBaseBoardMembers.call(
        {from: accountBoardMember}));
    try {
      await mockVideoBaseAccessor.funcWithOnlyVideoBaseBoardMembers.call(
          {from: accountTokenOwner});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    assert.isTrue(await mockVideoBaseAccessor.funcWithOnlyVideoBaseSystemAccounts.call(
        {from: accountContractOwner}));
    assert.isTrue(await mockVideoBaseAccessor.funcWithOnlyVideoBaseSystemAccounts.call(
        {from: accountSystem}));
    try {
      await mockVideoBaseAccessor.funcWithOnlyVideoBaseSystemAccounts.call(
          {from: accountTokenOwner});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    assert.isTrue(await mockVideoBaseAccessor.funcWithOnlyVideoBaseNewVideo.call(
        INVALID_VIDEO_ID));
    try {
      await mockVideoBaseAccessor.funcWithOnlyVideoBaseNewVideo.call(VALID_VIDEO_ID);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    assert.isTrue(await mockVideoBaseAccessor.funcWithOnlyVideoBaseExistingVideo.call(
        VALID_VIDEO_ID));
    try {
      await mockVideoBaseAccessor.funcWithOnlyVideoBaseExistingVideo.call(
          INVALID_VIDEO_ID);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    assert.isTrue(await mockVideoBaseAccessor.funcWithOnlyVideoBaseExistingToken.call(
        VALID_TOKEN_ID));
    try {
      await mockVideoBaseAccessor.funcWithOnlyVideoBaseExistingToken.call(
          INVALID_TOKEN_ID);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    await mockVideoBase.setMockVideoBaseAccessor(mockVideoBaseAccessor.address);
    assert.isTrue(await mockVideoBase.funcWithOnlyFromVideoBaseForMockVideoBaseAccessor.call());
    try {
      await mockVideoBaseAccessor.funcWithOnlyFromVideoBase.call();
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should test modifiers when videoBase is not set", async () => {
    let accountContractOwner = accounts[0];
    let accountTokenOwner = accounts[1];
    let accountBoardMember = accounts[2];
    let accountSystem = accounts[3];
    await mockVideoBaseAccessor.resetVideoBase();

    try {
      await mockVideoBaseAccessor.funcWithOnlyVideoBaseTokenOwnerOf.call(
          VALID_TOKEN_ID, {from: accountTokenOwner});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    try {
      await mockVideoBaseAccessor.funcWithWhenVideoBaseNotPaused.call();
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    try {
      await mockVideoBaseAccessor.funcWithOnlyVideoBaseBoardMembers(
          {from: accountContractOwner});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    try {
      await mockVideoBaseAccessor.funcWithOnlyVideoBaseSystemAccounts.call(
          {from: accountContractOwner});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    try {
      await mockVideoBaseAccessor.funcWithOnlyVideoBaseNewVideo.call(
          INVALID_VIDEO_ID);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    try {
      await mockVideoBaseAccessor.funcWithOnlyVideoBaseExistingVideo.call(
          VALID_VIDEO_ID);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    try {
      await mockVideoBaseAccessor.funcWithOnlyVideoBaseExistingToken.call(
          VALID_TOKEN_ID);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    await mockVideoBase.setMockVideoBaseAccessor(mockVideoBaseAccessor.address);
    try {
      await mockVideoBase.funcWithOnlyFromVideoBaseForMockVideoBaseAccessor.call();
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

});
