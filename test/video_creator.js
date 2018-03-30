const VideoBase = artifacts.require("./VideoBase.sol");
const VideoCreator = artifacts.require("./VideoCreator.sol");
const AssertJump = require("./assert_jump.js");

contract('VideoCreator', async (accounts) => {

  const YOUTUBE_PREFIX = "YUTB_";
  const YOUTUBE_VIDEO_ID = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6viIBmU");
  const YOUTUBE_VIEW_COUNT = 12345678;
  // VIDEO ID 2 similar to VIDEO ID
  const YOUTUBE_VIDEO_ID2 = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6viIBmV");
  const YOUTUBE_VIEW_COUNT2 = 87654321;
  const YOUTUBE_VIDEO_ID3 = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6v123mV");
  const YOUTUBE_VIEW_COUNT3 = 8765;

  it("should add video correctly", async () => {
    let videoBase = await VideoBase.deployed();
    let videoCreator = await VideoCreator.deployed();

    await videoCreator.setVideoBase(videoBase.address);
    await videoBase.addTrustedContract(videoCreator.address);

    await videoCreator.proposeNewVideo(YOUTUBE_VIDEO_ID);
    await videoCreator.addNewVideo(YOUTUBE_VIDEO_ID, YOUTUBE_VIEW_COUNT);

    await videoCreator.proposeNewVideo(YOUTUBE_VIDEO_ID2);
    await videoCreator.addNewVideo(YOUTUBE_VIDEO_ID2, YOUTUBE_VIEW_COUNT2);

    let _totalSupply = await videoBase.totalSupply.call();
    let totalSupply = _totalSupply.toNumber();

    assert.equal(2, totalSupply);

    let _tokenId = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID);
    let _tokenId2 = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID2);

    assert.equal(1, _tokenId.toNumber());
    assert.equal(2, _tokenId2.toNumber());

    let _viewCount = await videoBase.getVideoViewCount.call(YOUTUBE_VIDEO_ID);
    let _viewCount2 = await videoBase.getVideoViewCount.call(YOUTUBE_VIDEO_ID2);

    assert.equal(YOUTUBE_VIEW_COUNT, _viewCount.toNumber());
    assert.equal(YOUTUBE_VIEW_COUNT2, _viewCount2.toNumber());

    let _tokenOwner = await videoBase.ownerOf.call(_tokenId);
    let _tokenOwner2 = await videoBase.ownerOf.call(_tokenId2);

    assert.equal(accounts[0], _tokenOwner);
    assert.equal(accounts[0], _tokenOwner2);
  });

  it("should disallow adding existing videos", async () => {
    let videoCreator = await VideoCreator.deployed();

    try {
      await videoCreator.proposeNewVideo(YOUTUBE_VIDEO_ID);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    try {
      await videoCreator.addNewVideo(YOUTUBE_VIDEO_ID, YOUTUBE_VIEW_COUNT);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should disallow adding videos when paused", async () => {
    let videoBase = await VideoBase.deployed();
    let videoCreator = await VideoCreator.deployed();

    await videoBase.pause();

    try {
      await videoCreator.proposeNewVideo(YOUTUBE_VIDEO_ID3);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    try {
      await videoCreator.addNewVideo(YOUTUBE_VIDEO_ID3, YOUTUBE_VIEW_COUNT3);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    await videoBase.unpause();
  });

  it("should enforce permissions", async () => {
    let videoBase = await VideoBase.deployed();
    let videoCreator = await VideoCreator.deployed();
    var accountOwner = accounts[0];
    var accountSystem = accounts[1];
    var accountBoardMember = accounts[2];
    var accountNothing = accounts[3];

    await videoBase.addSystemAccount(accountSystem);
    await videoBase.addBoardMember(accountBoardMember);

    try {
      await videoCreator.proposeNewVideo(
          YOUTUBE_VIDEO_ID3, {from: accountNothing});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    try {
      await videoCreator.addNewVideo(
          YOUTUBE_VIDEO_ID3, YOUTUBE_VIEW_COUNT3, {from: accountNothing});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    await videoCreator.proposeNewVideo(YOUTUBE_VIDEO_ID3);
    await videoCreator.addNewVideo(
        YOUTUBE_VIDEO_ID3, YOUTUBE_VIEW_COUNT3, {from: accountSystem});

    let _totalSupply = await videoBase.totalSupply.call();
    let totalSupply = _totalSupply.toNumber();

    assert.equal(3, totalSupply);

    let _viewCount3 = await videoBase.getVideoViewCount.call(
        YOUTUBE_VIDEO_ID3, {from: accountBoardMember});

    assert.equal(YOUTUBE_VIEW_COUNT3, _viewCount3.toNumber());

    let _tokenId3 = await videoBase.getTokenId(YOUTUBE_VIDEO_ID3);
    let _ownerOf3 = await videoBase.ownerOf.call(_tokenId3);
    assert.equal(accountOwner, _ownerOf3);
  });

});
