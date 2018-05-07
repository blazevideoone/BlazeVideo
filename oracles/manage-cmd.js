var oracleUtils = require('./utils/oracle-utils.js')(web3);
var config = require('config');
var path = require('path');
var myArgs = require('optimist')
                .string('account')
                .string('val')
                .argv;

module.exports = function(finalCallback) {


  // Get accounts from web3
  web3.eth.getAccounts((err, accounts) => {
    var main = async () => {

      let videoBase = await oracleUtils.getVideoBase();
      let videoCreator = await oracleUtils.getVideoCreator();
      let videoAuction = await oracleUtils.getVideoAuction();
      let videoBreed = await oracleUtils.getVideoBreed();
      let bitVideoCoin = await oracleUtils.getBitVideoCoin();
      let videoCoinRule = await oracleUtils.getVideoCoinRule();
      console.log('VideoBase contract address: ' + videoBase.address);
      console.log('VideoCreator contract address: ' + videoCreator.address);
      console.log('VideoAuction contract address: ' + videoAuction.address);
      console.log('VideoBreed contract address: ' + videoBreed.address);
      console.log('BitVideoCoin contract address: ' + bitVideoCoin.address);
      console.log('VideoCoinRule contract address: ' + videoCoinRule.address);
      console.log();

      function parseVal(s, type) {
        switch (type) {
          case "ether":
            return web3.toWei(parseFloat(s), "ether");
          case "int":
            return parseInt(s);
          default:
            return s;
        }
      }
      var cmds = {
        'owner':
            {val: null,                                       isCall: true,  cmd: videoBase.owner}
        , 'transferOwnership':
            {val: 'ownerAddress',                             isCall: false, cmd: videoBase.transferOwnership}

        , 'getBoardMembers':
            {val: null,                                       isCall: true,  cmd: videoBase.getBoardMembers}
        , 'addBoardMember':
            {val: 'boardMemberAddress',                       isCall: false, cmd: videoBase.addBoardMember}
        , 'removeBoardMember':
            {val: 'boardMemberAddress',                       isCall: false, cmd: videoBase.removeBoardMember}
        , 'getSystemAccounts':
            {val: null,                                       isCall: true,  cmd: videoBase.getSystemAccounts}
        , 'addSystemAccount':
            {val: 'systemAccountAddress',                     isCall: false, cmd: videoBase.addSystemAccount}
        , 'removeSystemAccount':
            {val: 'systemAccountAddress',                     isCall: false, cmd: videoBase.removeSystemAccount}
        , 'getTrustedContracts':
            {val: null,                                       isCall: true,  cmd: videoBase.getTrustedContracts}
        , 'addTrustedContract':
            {val: 'contractAddress',                          isCall: false, cmd: videoBase.addTrustedContract}
        , 'removeTrustedContract':
            {val: 'contractAddress',                          isCall: false, cmd: videoBase.removeTrustedContract}
        , 'getListeners':
            {val: null,                                       isCall: true,  cmd: videoBase.getListeners}
        , 'addListener':
            {val: 'contractAddress',                          isCall: false, cmd: videoBase.addListener}
        , 'removeListener':
            {val: 'contractAddress',                          isCall: false, cmd: videoBase.removeListener}

        , 'getTrustedContractsForBitVideoCoin':
            {val: null,                                       isCall: true,  cmd: bitVideoCoin.getTrustedContracts}
        , 'addTrustedContractForBitVideoCoin':
            {val: 'contractAddress',                          isCall: false, cmd: bitVideoCoin.addTrustedContract}
        , 'removeTrustedContractForBitVideoCoin':
            {val: 'contractAddress',                          isCall: false, cmd: bitVideoCoin.removeTrustedContract}

        , 'getVideoBaseForCreator':
            {val: null,                                       isCall: true,  cmd: videoCreator.getVideoBase}
        , 'setVideoBaseForCreator':
            {val: 'contractAddress',                          isCall: false, cmd: videoCreator.setVideoBase}
        , 'resetVideoBaseForCreator':
            {val: null,                                       isCall: false, cmd: videoCreator.resetVideoBase}
        , 'getVideoBaseForAuction':
            {val: null,                                       isCall: true,  cmd: videoAuction.getVideoBase}
        , 'setVideoBaseForAuction':
            {val: 'contractAddress',                          isCall: false, cmd: videoAuction.setVideoBase}
        , 'resetVideoBaseForAuction':
            {val: null,                                       isCall: false, cmd: videoAuction.resetVideoBase}
        , 'getVideoBaseForBreed':
            {val: null,                                       isCall: true,  cmd: videoBreed.getVideoBase}
        , 'setVideoBaseForBreed':
            {val: 'contractAddress',                          isCall: false, cmd: videoBreed.setVideoBase}
        , 'resetVideoBaseForBreed':
            {val: null,                                       isCall: false, cmd: videoBreed.resetVideoBase}
        , 'getVideoBaseForVideoCoinRule':
            {val: null,                                       isCall: true,  cmd: videoCoinRule.getVideoBase}
        , 'setVideoBaseForVideoCoinRule':
            {val: 'contractAddress',                          isCall: false, cmd: videoCoinRule.setVideoBase}
        , 'resetVideoBaseForVideoCoinRule':
            {val: null,                                       isCall: false, cmd: videoCoinRule.resetVideoBase}
        , 'getBitVideoCoinForVideoCoinRule':
            {val: null,                                       isCall: true,  cmd: videoCoinRule.bitVideoCoin}
        , 'setBitVideoCoinForVideoCoinRule':
            {val: 'contractAddress',                          isCall: false, cmd: videoCoinRule.setBitVideoCoin}

        , 'videoUpdateCost':
            {val: null,                                       isCall: true,  cmd: videoCreator.videoUpdateCost}
        , 'setVideoUpdateCost':
            {val: 'costInEther', type: "ether",               isCall: false, cmd: videoCreator.setVideoUpdateCost}

        , 'getOwnerCut':
            {val: null,                                       isCall: true,  cmd: videoAuction.getOwnerCut}
        , 'setOwnerCut':
            {val: 'ownerCut(0-10,000)', type: "int",          isCall: false, cmd: videoAuction.setOwnerCut}
        , 'getNewVideoPricePerViewCount':
            {val: null,                                       isCall: true,  cmd: videoAuction.getNewVideoPricePerViewCount}
        , 'setNewVideoPricePerViewCount':
            {val: 'pricePerViewCountInEther', type: "ether",  isCall: false, cmd: videoAuction.setNewVideoPricePerViewCount}
        , 'getForceSellPricePerViewCount':
            {val: null,                                       isCall: true,  cmd: videoAuction.getForceSellPricePerViewCount}
        , 'setForceSellPricePerViewCount':
            {val: 'pricePerViewCountInEther', type: "ether",  isCall: false, cmd: videoAuction.setForceSellPricePerViewCount}
        , 'getExtraForceSellPriceRatio':
            {val: null,                                       isCall: true,  cmd: videoAuction.getExtraForceSellPriceRatio}
        , 'setExtraForceSellPriceRatio':
            {val: 'ratio(0-10,000)', type: "int",             isCall: false, cmd: videoAuction.setExtraForceSellPriceRatio}
      };
      var cmdsList = [
        'owner', 'transferOwnership'

        , 'getBoardMembers', 'addBoardMember', 'removeBoardMember'
        , 'getSystemAccounts', 'addSystemAccount', 'removeSystemAccount'
        , 'getTrustedContracts', 'addTrustedContract', 'removeTrustedContract'
        , 'getListeners', 'addListener', 'removeListener'

        , 'getTrustedContractsForBitVideoCoin', 'addTrustedContractForBitVideoCoin', 'removeTrustedContractForBitVideoCoin',

        , 'getVideoBaseForCreator', 'setVideoBaseForCreator', 'resetVideoBaseForCreator'
        , 'getVideoBaseForBreed', 'setVideoBaseForBreed', 'resetVideoBaseForBreed'
        , 'getVideoBaseForAuction', 'setVideoBaseForAuction', 'resetVideoBaseForAuction'
        , 'getVideoBaseForVideoCoinRule', 'setVideoBaseForVideoCoinRule', 'resetVideoBaseForVideoCoinRule', 'getBitVideoCoinForVideoCoinRule', 'setBitVideoCoinForVideoCoinRule',

        , 'videoUpdateCost', 'setVideoUpdateCost'

        , 'getOwnerCut', 'setOwnerCut'
        , 'getNewVideoPricePerViewCount', 'setNewVideoPricePerViewCount'
        , 'getForceSellPricePerViewCount', 'setForceSellPricePerViewCount'
        , 'getExtraForceSellPriceRatio', 'setExtraForceSellPriceRatio'
      ];

      if (!myArgs.cmd || !cmds[myArgs.cmd] || (!myArgs.val && !!cmds[myArgs.cmd].val)) {
        console.log("ERROR missing argument...");
        console.log("Usage: truffle --network ... exec " + path.basename(__filename)
                    + " [--account account] --cmd cmd [--val val]");
        console.log("Parameter: account from, default to accounts[0]");
        console.log("Parameter: cmd the command");
        console.log("Parameter: val the value to the command, optional");
        console.log("Commands:")
        cmdsList.forEach((cmd) => {
          console.log(cmd + (!!cmds[cmd].val ? ' --val ' + cmds[cmd].val : ''));
        });
        finalCallback();
        return;
      }

      var cmd = cmds[myArgs.cmd];
      var val = !!cmd.val ? parseVal(myArgs.val, cmd.type) : null;
      var account = myArgs.account ? myArgs.account : accounts[0];
      console.log("From account: " + account);
      try {
        if (cmd.isCall) {
          console.log("Getting: " + myArgs.cmd + (cmd.val ? " " + val : ""));
          if (!cmd.val) {
            console.log("Result:");
            console.log(await cmd.cmd.call({from: account}));
          } else {
            console.log("Result:");
            console.log(await cmd.cmd.call(val, {from: account}));
          }
        } else {
          console.log("Executing: " + myArgs.cmd + (cmd.val ? " " + val : ""));
          if (!cmd.val) {
            console.log("Result:");
            console.log(await cmd.cmd({from: account}));
          } else {
            console.log("Result:");
            console.log(await cmd.cmd(val, {from: account}));
          }
        }
      } catch (err) {
        console.log(err);
      }
      finalCallback();
    };

    main();
  })
}
