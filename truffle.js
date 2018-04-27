var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = require(process.env.MNEMOICJS || "./truffle-dev-mnemonic.js");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*" // Match any network id
    },
    rinkeby:  {
      network_id: 4,
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/qpTujEnIBcuxR25bsCGW");
      }
    }
  }
};
