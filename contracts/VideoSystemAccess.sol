pragma solidity ^0.4.18;

import './VideoAccessControl.sol';

/// @dev Contract to allow system accounts access and to do jobs.
contract VideoSystemAccess is VideoAccessControl {

  /// @dev Array of system accounts' addresses.
  address[] public systemAccounts;

  /// @dev Emitted when a new system account is added.
  /// @param newSystemAccount new system account's address added.
  event SystemAccountAdded(address newSystemAccount);

  /// @dev Emitted when an old system account is removed.
  /// @param oldSystemAccount old system account's address removed.
  event SystemAccountRemoved(address oldSystemAccount);

  /// @dev Access modifier for system accounts functionality. Owner(aka CEO)
  ///   is also a system account.
  modifier onlySystemAccounts() {
    require(msg.sender == owner ||
            findSystemAccount(msg.sender) >= 0);
    _;
  }

  /// @dev find the system account index for an address, or -1 if not found.
  /// @param _address the address to be searched for.
  function findSystemAccount(address _address) public view returns (int) {
    for (uint i = 0; i < systemAccounts.length; i++) {
      if (_address == systemAccounts[i]) {
        return int(i);
      }
    }
    return -1;
  }

  /// @dev Add a new address to the board.
  /// @param _newSystemAccount the new address to be added. If it is already a
  //    system account, do nothing.
  function addSystemAccount(address _newSystemAccount) public onlyOwner {
    require(findSystemAccount(_newSystemAccount) < 0);
    systemAccounts.push(_newSystemAccount);
    SystemAccountAdded(_newSystemAccount);
  }

  /// @dev Remove an old system account address from the board.
  /// @param _oldSystemAccount the address to be removed. If it is not a
  //    system account, do nothing.
  function removeSystemAccount(address _oldSystemAccount) public onlyOwner {
    int i = findSystemAccount(_oldSystemAccount);
    require(i >= 0);
    delete systemAccounts[uint(i)];
    SystemAccountAdded(_oldSystemAccount);
  }

  /// @dev Return a list of current system accounts.
  function getSystemAccounts() public view onlySystemAccounts returns (address[]) {
    return systemAccounts;
  }

}
