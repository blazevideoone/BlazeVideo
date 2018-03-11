pragma solidity ^0.4.4;

import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';
import 'zeppelin-solidity/contracts/lifecycle/Destructible.sol';
import 'zeppelin-solidity/contracts/ownership/HasNoEther.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract VideoAccessControl is
    Ownable,
    Pausable,
    Destructible,
    HasNoEther
  {

  /// @dev Array of board members' addresses.
  address[] public boardMembers;

  /// @dev Emitted when a new board member is added.
  /// @param newBoardMember new board member's address added.
  event BoardMemberAdded(address newBoardMember);

  /// @dev Emitted when an old board member is removed.
  /// @param oldBoardMember old board member's address removed.
  event BoardMemberRemoved(address oldBoardMember);

  /// @dev Access modifier for board members functionality. Owner(aka CEO)
  ///   is also a board member.
  modifier onlyBoardMembers() {
    require(msg.sender == owner ||
            _findBoardMember(msg.sender) >= 0);
    _;
  }

  /// @dev find the board member index for an address, or -1 if not found.
  /// @param _address the address to be searched for.
  function _findBoardMember(address _address) internal view returns (int) {
    for (uint i = 0; i < boardMembers.length; i++) {
      if (_address == boardMembers[i]) {
        return int(i);
      }
    }
    return -1;
  }

  /// @dev Add a new address to the board.
  /// @param _newBoardMember the new address to be added. If it is already a
  //    board member, do nothing.
  function addBoardMember(address _newBoardMember) public onlyOwner {
    if (_findBoardMember(_newBoardMember) < 0) {
      boardMembers.push(_newBoardMember);
      BoardMemberAdded(_newBoardMember);
    }
  }

  /// @dev Remove an old board member address from the board.
  /// @param _oldBoardMember the address to be removed. If it is not a
  //    board member, do nothing.
  function removeBoardMember(address _oldBoardMember) public onlyOwner {
    int i = _findBoardMember(_oldBoardMember);
    if (i >= 0) {
      delete boardMembers[uint(i)];
      BoardMemberAdded(_oldBoardMember);
    }
  }

  /// @dev Return a list of current board members.
  function getBoardMembers() public view onlyBoardMembers returns (address[]) {
    return boardMembers;
  }

  function pause() public onlyBoardMembers whenNotPaused {
    paused = true;
    Pause();
  }

  function isPaused() public view returns (bool){
    return paused;
  }
}
