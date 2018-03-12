const VideoBase = artifacts.require("./VideoBase.sol");

contract('VideoBase', async (accounts) => {

  const YOUTUBE_PREFIX = "YUTB_";
  const YOUTUBE_VIDEO_ID = YOUTUBE_PREFIX + "HPPj6viIBmU";
  const YOUTUBE_VIEW_COUNT = 12345678;
  // VIDEO ID 2 similar to VIDEO ID
  const YOUTUBE_VIDEO_ID2 = YOUTUBE_PREFIX + "HPPj6viIBmV";
  const YOUTUBE_VIEW_COUNT2 = 87654321;
  const YOUTUBE_VIDEO_ID3 = YOUTUBE_PREFIX + "HPPj6v123mV";
  const YOUTUBE_VIEW_COUNT3 = 8765;

  it("should add video correctly", async () => {
    let videoBase = await VideoBase.deployed();

    await videoBase.proposeNewVideo(YOUTUBE_VIDEO_ID);
    await videoBase.addNewVideo(YOUTUBE_VIDEO_ID, YOUTUBE_VIEW_COUNT);

    await videoBase.proposeNewVideo(YOUTUBE_VIDEO_ID2);
    await videoBase.addNewVideo(YOUTUBE_VIDEO_ID2, YOUTUBE_VIEW_COUNT2);

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
  });

  it("should disallow adding existing videos", async () => {
    let videoBase = await VideoBase.deployed();

    try {
      await videoBase.proposeNewVideo(YOUTUBE_VIDEO_ID);
      assert.fail("should have thrown before");
    } catch(error) {
      assert.isNotNull(error);
    }
    try {
      await videoBase.addNewVideo(YOUTUBE_VIDEO_ID, YOUTUBE_VIEW_COUNT);
      assert.fail("should have thrown before");
    } catch(error) {
      assert.isNotNull(error);
    }
  });

  it("should disallow get non-existing videos", async () => {
    let videoBase = await VideoBase.deployed();

    try {
      await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID3);
      assert.fail("should have thrown before");
    } catch(error) {
      assert.isNotNull(error);
    }
    try {
      await videoBase.getVideoViewCount.call(YOUTUBE_VIDEO_ID3);
      assert.fail("should have thrown before");
    } catch(error) {
      assert.isNotNull(error);
    }
  });

  it("should disallow adding videos when paused", async () => {
    let videoBase = await VideoBase.deployed();

    await videoBase.pause();

    try {
      await videoBase.proposeNewVideo(YOUTUBE_VIDEO_ID3);
      assert.fail("should have thrown before");
    } catch(error) {
      assert.isNotNull(error);
    }
    try {
      await videoBase.addNewVideo(YOUTUBE_VIDEO_ID3, YOUTUBE_VIEW_COUNT3);
      assert.fail("should have thrown before");
    } catch(error) {
      assert.isNotNull(error);
    }

    await videoBase.unpause();
  });

  it("should enforce permissions", async () => {
    let videoBase = await VideoBase.deployed();
    var accountOwner = accounts[0];
    var accountSystem = accounts[1];
    var accountBoardMember = accounts[2];
    var accountNothing = accounts[3];

    await videoBase.addSystemAccount(accountSystem);
    await videoBase.addBoardMember(accountBoardMember);

    try {
      await videoBase.proposeNewVideo(
          YOUTUBE_VIDEO_ID3, {from: accountNothing});
      assert.fail("should have thrown before");
    } catch(error) {
      assert.isNotNull(error);
    }
    try {
      await videoBase.addNewVideo(
          YOUTUBE_VIDEO_ID3, YOUTUBE_VIEW_COUNT3, {from: accountNothing});
      assert.fail("should have thrown before");
    } catch(error) {
      assert.isNotNull(error);
    }
    try {
      await videoBase.getVideoViewCount.call(
          YOUTUBE_VIDEO_ID, {from: accountNothing});
      assert.fail("should have thrown before");
    } catch(error) {
      assert.isNotNull(error);
    }

    await videoBase.proposeNewVideo(YOUTUBE_VIDEO_ID3);
    await videoBase.addNewVideo(
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
