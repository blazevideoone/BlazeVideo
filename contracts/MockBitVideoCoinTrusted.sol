pragma solidity ^0.4.18;

import './BitVideoCoin.sol';

contract MockBitVideoCoinTrusted {

  /*** STORAGE **/
  BitVideoCoin bitVideoCoin;

  /**
   * @dev constructor
   */
  function MockBitVideoCoinTrusted(address _bitVideoCoinAddress) public {
    bitVideoCoin = BitVideoCoin(_bitVideoCoinAddress);
  }

  /**
   * @dev mint for test
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address _to, uint256 _amount)
      public
      returns (bool) {
    return bitVideoCoin.mintTrusted(_to, _amount);
  }

  /**
   * @dev burn for test
   * @param _who The address that amount of token is burned.
   * @param _value The amount of token to be burned.
   */
  function burn(address _who, uint256 _value) public {
    bitVideoCoin.burnTrusted(_who, _value);
  }
}
