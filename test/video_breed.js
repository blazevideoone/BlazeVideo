const VideoBreed = artifacts.require("./VideoBreed.sol");

contract('VideoBreed', async (accounts) => {

  const SECONDS_PER_BLOCK = 10 * 30;
  const YOUTUBE_PREFIX = "YUTB_";
  const YOUTUBE_VIDEO_ID = YOUTUBE_PREFIX + "HPPj6viIBmU";
  const YOUTUBE_VIEW_COUNT = 12345678;
  // VIDEO ID 2 similar to VIDEO ID
  const YOUTUBE_VIDEO_ID2 = YOUTUBE_PREFIX + "HPPj6viIBmV";
  const YOUTUBE_VIEW_COUNT2 = 87654321;
  const YOUTUBE_VIDEO_ID3 = YOUTUBE_PREFIX + "HPPj6v123mV";
  const YOUTUBE_VIEW_COUNT3 = 8765;

  const TOKEN_ID_NOT_EXIST = 1000;

  it("should add video breeding info correctly", async () => {
    let videoBreed = await VideoBreed.deployed();
    let cooldowns = await videoBreed.getCooldowns.call();
    assert.equal(10, cooldowns.length);

    await videoBreed.setSecondsPerBlock(SECONDS_PER_BLOCK);

    await videoBreed.proposeNewVideo(YOUTUBE_VIDEO_ID);
    await videoBreed.addNewVideo(YOUTUBE_VIDEO_ID, YOUTUBE_VIEW_COUNT);

    let secondsPerBlock = await videoBreed.getSecondsPerBlock.call();
    let tokenId = await videoBreed.getTokenId.call(YOUTUBE_VIDEO_ID);
    let breeding = await videoBreed.getBreeding.call(tokenId);

    assert.equal(SECONDS_PER_BLOCK, secondsPerBlock);
    // cooldownEndBlock
    assert.equal(web3.eth.blockNumber + cooldowns[0] / secondsPerBlock,
                 breeding[0]);
    // cooldownIndex
    assert.equal(0, breeding[1]);
    // generation
    assert.equal(0, breeding[2]);
  });

  it("should breed video correctly", async () => {
    let videoBreed = await VideoBreed.deployed();
    let cooldowns = await videoBreed.getCooldowns.call();
    let secondsPerBlock = await videoBreed.getSecondsPerBlock.call();

    let tokenId = await videoBreed.getTokenId.call(YOUTUBE_VIDEO_ID);
    await videoBreed.setCooldownEndBlock(tokenId, web3.eth.blockNumber);
    await videoBreed.startBreeding(tokenId);
    let breeding = await videoBreed.getBreeding(tokenId);
    // cooldownEndBlock
    assert.equal(web3.eth.blockNumber + cooldowns[1] / secondsPerBlock,
                 breeding[0]);
    // cooldownIndex
    assert.equal(1, breeding[1]);
    // generation
    assert.equal(0, breeding[2]);

    await videoBreed.breedVideo(accounts[0],
                                YOUTUBE_VIDEO_ID,
                                YOUTUBE_VIDEO_ID2,
                                YOUTUBE_VIEW_COUNT2);
    let childTokenId = await videoBreed.getTokenId.call(YOUTUBE_VIDEO_ID2);
    let childBreeding = await videoBreed.getBreeding.call(childTokenId);
    let childViewCount = await videoBreed.getVideoViewCount.call(YOUTUBE_VIDEO_ID2);
    let childOwner = await videoBreed.ownerOf.call(childTokenId);

    // cooldownEndBlock
    assert.equal(web3.eth.blockNumber + cooldowns[0] / secondsPerBlock,
                 childBreeding[0]);
    // cooldownIndex
    assert.equal(0, childBreeding[1]);
    // generation
    assert.equal(1, childBreeding[2]);
    assert.equal(accounts[0], childOwner);

    assert.equal(YOUTUBE_VIEW_COUNT2, childViewCount);
  });

  it("should set cooldown info correctly", async () => {
    let videoBreed = await VideoBreed.deployed();
    let cooldowns = await videoBreed.getCooldowns.call();
    let secondsPerBlock = await videoBreed.getSecondsPerBlock.call();

    let tokenId = await videoBreed.getTokenId.call(YOUTUBE_VIDEO_ID);
    for (var i = 1; i < cooldowns.length - 1; i++) {
      await videoBreed.setCooldownEndBlock(tokenId, web3.eth.blockNumber);
      await videoBreed.startBreeding(tokenId);
      let breeding = await videoBreed.getBreeding(tokenId);
      // cooldownEndBlock
      assert.equal(web3.eth.blockNumber + cooldowns[i + 1] / secondsPerBlock,
                   breeding[0]);
      // cooldownIndex
      assert.equal(i + 1, breeding[1]);
    }

    // Last cooldown
    await videoBreed.setCooldownEndBlock(tokenId, web3.eth.blockNumber);
    await videoBreed.startBreeding(tokenId);
    let breeding = await videoBreed.getBreeding(tokenId);
    // cooldownEndBlock
    assert.equal(web3.eth.blockNumber + cooldowns[9] / secondsPerBlock,
                 breeding[0]);
    // cooldownIndex
    assert.equal(cooldowns.length - 1, breeding[1]);

    // Once again after last cooldown
    await videoBreed.setCooldownEndBlock(tokenId, web3.eth.blockNumber);
    await videoBreed.startBreeding(tokenId);
    breeding = await videoBreed.getBreeding(tokenId);
    // cooldownEndBlock
    assert.equal(web3.eth.blockNumber + cooldowns[9] / secondsPerBlock,
                 breeding[0]);
    // cooldownIndex
    assert.equal(cooldowns.length - 1, breeding[1]);
  });

  it("should disallow breeding from non-existing video", async () => {
    let videoBreed = await VideoBreed.deployed();
    try {
      await videoBreed.startBreeding(TOKEN_ID_NOT_EXIST);
      assert.fail("should not breed non-existing video");
    } catch (error) {
      assert.isNotNull(error);
    }
  });

  it("should disallow breeding existing video", async () => {
    let videoBreed = await VideoBreed.deployed();
    try {
      await videoBreed.breedVideo(accounts[0],
                                  YOUTUBE_VIDEO_ID,
                                  YOUTUBE_VIDEO_ID,
                                  YOUTUBE_VIEW_COUNT);
      assert.fail("should not breed existing video");
    } catch (error) {
      assert.isNotNull(error);
    }
  });

  it("should enforce pause", async () => {
    let videoBreed = await VideoBreed.deployed();
    let tokenId = await videoBreed.getTokenId.call(YOUTUBE_VIDEO_ID);

    await videoBreed.pause();

    await videoBreed.setCooldownEndBlock(tokenId, web3.eth.blockNumber);
    try {
      await videoBreed.startBreeding(tokenId);
      assert.fail("should have failed here");
    } catch (error) {
      assert.isNotNull(error);
    }
    try {
      await videoBreed.breedVideo(accounts[0],
                                  YOUTUBE_VIDEO_ID,
                                  YOUTUBE_VIDEO_ID3,
                                  YOUTUBE_VIEW_COUNT3);
      assert.fail("should have failed here");
    } catch (error) {
      assert.isNotNull(error);
    }

    await videoBreed.unpause();
  });

  it("should enforce permissions", async () => {
    let videoBreed = await VideoBreed.deployed();
    var accountOwner = accounts[0];
    var accountSystem = accounts[1];
    var accountBoardMember = accounts[2];
    var accountNothing = accounts[3];

    let tokenId = await videoBreed.getTokenId.call(YOUTUBE_VIDEO_ID);

    await videoBreed.addSystemAccount(accountSystem);
    await videoBreed.addBoardMember(accountBoardMember);

    await videoBreed.setCooldownEndBlock(tokenId, web3.eth.blockNumber);
    try {
      // Not owner of the token
      await videoBreed.startBreeding(tokenId, {from: accountBoardMember});
      assert.fail("should have failed here");
    } catch (error) {
      assert.isNotNull(error);
    }
    try {
      await videoBreed.breedVideo(accounts[0],
                                  YOUTUBE_VIDEO_ID,
                                  YOUTUBE_VIDEO_ID3,
                                  YOUTUBE_VIEW_COUNT3,
                                  {from: accountNothing});
      assert.fail("should have failed here");
    } catch (error) {
      assert.isNotNull(error);
    }

    try {
      await videoBreed.setSecondsPerBlock(11, {from: accountNothing});
      assert.fail("should have failed here");
    } catch (error) {
      assert.isNotNull(error);
    }
    await videoBreed.setSecondsPerBlock(11, {from: accountBoardMember});
    let secondsPerBlock = await videoBreed.getSecondsPerBlock.call(
        {from: accountBoardMember});
    assert.equal(11, secondsPerBlock);

    try {
      await videoBreed.getCooldowns.call({from: accountNothing});
      assert.fail("should have failed here");
    } catch (error) {
      assert.isNotNull(error);
    }
    let cooldowns = await videoBreed.getCooldowns.call({from: accountOwner});
    try {
      await videoBreed.setCooldownEndBlock.call(tokenId,
                                                web3.eth.blockNumber,
                                                {from: accountNothing});
      assert.fail("should have failed here");
    } catch (error) {
      assert.isNotNull(error);
    }

    try {
      await videoBreed.getBreeding.call(tokenId, {from: accountNothing});
      assert.fail("should have failed here");
    } catch (error) {
      assert.isNotNull(error);
    }
    let breeding = await videoBreed.getBreeding.call(
        tokenId, {from: accountBoardMember});
    // cooldownIndex
    assert.equal(cooldowns.length - 1, breeding[1]);
  });

  it("should breed video for another account correctly", async () => {
    let videoBreed = await VideoBreed.deployed();
    var accountOwner = accounts[0];
    var accountSystem = accounts[1];
    var accountNothing = accounts[3];

    let cooldowns = await videoBreed.getCooldowns.call();
    let secondsPerBlock = await videoBreed.getSecondsPerBlock.call();

    let tokenId = await videoBreed.getTokenId.call(YOUTUBE_VIDEO_ID);
    await videoBreed.transfer(accountNothing, tokenId);

    await videoBreed.setCooldownEndBlock(tokenId, web3.eth.blockNumber);
    await videoBreed.startBreeding(tokenId, {from: accountNothing});

    await videoBreed.breedVideo(accountNothing,
                                YOUTUBE_VIDEO_ID,
                                YOUTUBE_VIDEO_ID3,
                                YOUTUBE_VIEW_COUNT3,
                                {from: accountSystem});
    let childTokenId = await videoBreed.getTokenId.call(YOUTUBE_VIDEO_ID3);
    let childBreeding = await videoBreed.getBreeding.call(childTokenId);
    let childViewCount = await videoBreed.getVideoViewCount.call(YOUTUBE_VIDEO_ID3);
    let childOwner = await videoBreed.ownerOf.call(childTokenId);

    // cooldownEndBlock
    assert.equal(Math.floor(web3.eth.blockNumber + cooldowns[0] / secondsPerBlock),
                 childBreeding[0]);
    // cooldownIndex
    assert.equal(0, childBreeding[1]);
    // generation
    assert.equal(1, childBreeding[2]);
    assert.equal(accountNothing, childOwner);

    assert.equal(YOUTUBE_VIEW_COUNT3, childViewCount);
  });

});
