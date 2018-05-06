const VideoBase = artifacts.require("./VideoBase.sol");
const VideoCreator = artifacts.require("./VideoCreator.sol");
const VideoCoinRule = artifacts.require("./VideoCoinRule.sol");
const BitVideoCoin = artifacts.require("./BitVideoCoin.sol");
const AssertJump = require("./assert_jump.js");

contract('VideoCoinRule', async (accounts) => {

  const YOUTUBE_PREFIX = "YUTB_";
  const YOUTUBE_VIDEO_ID = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6viIBmU");
  const YOUTUBE_VIDEO_ID_PADDING = web3.fromAscii(
      YOUTUBE_PREFIX + "HPPj6viIBmU") + "00000000000000000000000000000000";
  const YOUTUBE_VIEW_COUNT = 12345678;
  const VIEW_INCREMENT = 500000000;

  const COIN_PER_VIEW_COUNT = 2;
  const MINIMUM_PAYOUT_AMOUNT = 200000;

  it("should update video and mint coin correctly", async () => {
    let videoBase = await VideoBase.deployed();
    let videoCreator = await VideoCreator.deployed();
    let videoCoinRule = await VideoCoinRule.deployed();
    let bitVideoCoin = await BitVideoCoin.deployed();

    await videoCoinRule.setCoinPerMilliViewCount(COIN_PER_VIEW_COUNT * 1000000);

    await videoCreator.addNewVideo(YOUTUBE_VIDEO_ID, YOUTUBE_VIEW_COUNT);
    let btvcInitialBalance = await bitVideoCoin.balanceOf.call(accounts[0]);
    let btvcInitialTotalSupply = await bitVideoCoin.totalSupply.call();
    await videoCreator.updateVideo(YOUTUBE_VIDEO_ID,
                                   YOUTUBE_VIEW_COUNT + VIEW_INCREMENT);
    let btvcBalance = await bitVideoCoin.balanceOf.call(accounts[0]);
    let btvcTotalSupply = await bitVideoCoin.totalSupply.call();
    assert.equal(VIEW_INCREMENT * COIN_PER_VIEW_COUNT,
                 btvcBalance - btvcInitialBalance);
    assert.equal(VIEW_INCREMENT * COIN_PER_VIEW_COUNT,
                 btvcTotalSupply - btvcInitialTotalSupply);
  });

  it("should payout and burn coin correctly", async () => {
    let videoBase = await VideoBase.deployed();
    let videoCoinRule = await VideoCoinRule.deployed();
    let bitVideoCoin = await BitVideoCoin.deployed();

    await videoCoinRule.setMinimumPayoutAmount(MINIMUM_PAYOUT_AMOUNT);

    let _result = await web3.eth.sendTransaction({
        from: accounts[0],
        to: videoCoinRule.address,
        value: web3.toWei(5, "ether")
    });

    let initialContractBalance =
        await web3.eth.getBalance(videoCoinRule.address);
    let initialOwnerBalance = await web3.eth.getBalance(accounts[0]);
    let btvcInitialBalance = await bitVideoCoin.balanceOf.call(accounts[0]);
    let btvcInitialTotalSupply = await bitVideoCoin.totalSupply.call();
    await videoCoinRule.payout(VIEW_INCREMENT);
    let contractBalance =
        await web3.eth.getBalance(videoCoinRule.address);
    let ownerBalance = await web3.eth.getBalance(accounts[0]);
    let btvcBalance = await bitVideoCoin.balanceOf.call(accounts[0]);
    let btvcTotalSupply = await bitVideoCoin.totalSupply.call();

    assert.equal(VIEW_INCREMENT, btvcInitialBalance - btvcBalance);
    assert.equal(VIEW_INCREMENT, btvcInitialTotalSupply - btvcTotalSupply);

    let payoutValue = initialContractBalance.times(VIEW_INCREMENT).
                          dividedBy(btvcInitialTotalSupply);
    assert.isAbove(0.01,
                   (payoutValue - (initialContractBalance - contractBalance)) /
                       (initialContractBalance - contractBalance));
    assert.isBelow(0, initialContractBalance - contractBalance);
    assert.isAbove(0.01,
                   (payoutValue - (ownerBalance - initialOwnerBalance)) /
                       (ownerBalance - initialOwnerBalance));
    assert.isBelow(0, ownerBalance - initialOwnerBalance);
  });

  it("should forbid payout", async () => {
    let videoCoinRule = await VideoCoinRule.deployed();
    let videoBase = await VideoBase.deployed();
    // below minimumPayoutAmount
    try {
      await videoCoinRule.payout(MINIMUM_PAYOUT_AMOUNT - 1);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    await videoBase.pause();
    // paused
    try {
      await videoCoinRule.payout(MINIMUM_PAYOUT_AMOUNT);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    await videoBase.unpause();
  });
});
