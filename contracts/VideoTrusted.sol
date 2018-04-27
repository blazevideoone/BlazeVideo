pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract VideoTrusted is
    Ownable
  {

  /// @dev Array of trusted contracts' addresses.
  address[] public trustedContracts;

  /// @dev Emitted when a new trusted contract is added.
  /// @param newTrustedContract new trusted contract's address added.
  event TrustedContractAdded(address newTrustedContract);

  /// @dev Emitted when an old trusted contract is removed.
  /// @param oldTrustedContract old trusted contract's address removed.
  event TrustedContractRemoved(address oldTrustedContract);

  /// @dev Access modifier for trusted contracts functionality. Owner(aka CEO)
  ///   is also a trusted contract.
  modifier onlyTrustedContracts() {
    require(msg.sender == owner ||
            findTrustedContract(msg.sender) >= 0);
    _;
  }

  /// @dev find the trusted contract index for an address, or -1 if not found.
  /// @param _address the address to be searched for.
  function findTrustedContract(address _address) public view returns (int) {
    for (uint i = 0; i < trustedContracts.length; i++) {
      if (_address == trustedContracts[i]) {
        return int(i);
      }
    }
    return -1;
  }

  /// @dev Add a new address to the board.
  /// @param _newTrustedContract the new address to be added. If it is already a
  //    trusted contract, do nothing.
  function addTrustedContract(address _newTrustedContract) public onlyOwner {
    require(findTrustedContract(_newTrustedContract) < 0);
    trustedContracts.push(_newTrustedContract);
    TrustedContractAdded(_newTrustedContract);
  }

  /// @dev Remove an old trusted contract address from the board.
  /// @param _oldTrustedContract the address to be removed. If it is not a
  //    trusted contract, do nothing.
  function removeTrustedContract(address _oldTrustedContract) public onlyOwner {
    int i = findTrustedContract(_oldTrustedContract);
    require(i >= 0);
    delete trustedContracts[uint(i)];
    TrustedContractAdded(_oldTrustedContract);
  }

  /// @dev Return a list of current trusted contracts.
  function getTrustedContracts() public view onlyTrustedContracts returns (address[]) {
    return trustedContracts;
  }

}
