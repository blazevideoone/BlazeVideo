pragma solidity ^0.4.4;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import './VideoSystemAccess.sol';

contract VideoBase
    is
    VideoSystemAccess,
    ERC721Token
  {

  /*** EVENTS ***/

  /// @dev Emitted when a new video is proposed to added. To be captured by
  ///   an oracle which imports the video.
  /// @param videoId new video id proposed.
  event NewVideoProposed(string videoId);

  /*** DATA TYPES ***/

  /// @dev The main video struct.
  struct Video {
    // The unique token id of the video.
    uint256 tokenId;

    // The video id. The first 4 characters are platform prefix, followed by
    // an underscore, and the video id on that platform.
    string videoId;

    // The timestamp from the block when this video is generated in the block.
    uint64 birthTime;

    // The last updated view count for the video.
    uint256 viewCount;

    // The timestamp from the block when the view count is last updated.
    uint64 viewCountUpdateTime;
  }


  /*** STORAGE ***/

  /// @dev An array containing the Video struct for all videos in existence.
  ///   The tokenId of each video is actually an index into this array. The
  ///   tokenId 0 is invalid.
  Video[] videos;

  /// @dev The video id mapping to token id.
  mapping (bytes32 => uint256) public videoIdToTokenId;

  /// @dev Initialize with tokenId 0 video.
  function VideoBase() public {
    Video memory _invalidVideo = Video({
        tokenId: 0,
        videoId: "INVALID",
        birthTime: 0,
        viewCount: 0,
        viewCountUpdateTime: 0
    });
    videos.push(_invalidVideo);

    _mint(msg.sender, _invalidVideo.tokenId);
    _burn(_invalidVideo.tokenId);
  }

  /// @dev throws if the video is not new.
  /// @param videoId to be checked.
  function _requireNewVideo(string videoId) internal view {
    require(videoIdToTokenId[_stringToBytes32(videoId)] == 0);
  }

  /// @dev throws if the video does not exist.
  /// @param videoId to be checked.
  function _requireExistingVideo(string videoId) internal view {
    uint256 tokenId = videoIdToTokenId[_stringToBytes32(videoId)];
    require(tokenId > 0);

    // Hopefully does not happen. Assert that the retrieved tokenId is indeed
    // mapped to videoId, since videoId is converted to bytes32.
    require(_stringEqual(videos[tokenId].videoId, videoId));
  }

  /// @dev retrieve tokenId from videoId for convenience.
  /// @param videoId whose tokenId is being retrieved.
  function getTokenId(string videoId) public view returns (uint256) {
    _requireExistingVideo(videoId);

    return videoIdToTokenId[_stringToBytes32(videoId)];
  }

  /// @dev propose to add a video, must be a new video. Emitting NewVideoProposed event
  ///   for the oracle to add a new video. Only the owner is allowed to propose.
  /// @param videoId to be proposed as a new video.
  function proposeNewVideo(string videoId) public onlyOwner whenNotPaused {
    _requireNewVideo(videoId);
    NewVideoProposed(videoId);
  }

  /// @dev actually add a new video, usually proposed by the owner and added by
  ///   a system account.
  /// @param videoId to be proposed as a new video.
  /// @param viewCount fetched from the video platform.
  function addNewVideo(string videoId, uint256 viewCount)
      public onlySystemAccounts whenNotPaused {
    _addNewVideo(owner, videoId, viewCount);
  }

  /// @dev internal function to add a new video and return the new token id.
  /// @param videoOwner owner of the new video.
  /// @param videoId to be proposed as a new video.
  /// @param viewCount fetched from the video platform.
  function _addNewVideo(address videoOwner, string videoId, uint256 viewCount)
      internal
      returns (uint256) {
    _requireNewVideo(videoId);
    Video memory _newVideo = Video({
        tokenId: 0,
        videoId: videoId,
        birthTime: uint64(now),
        viewCount: 0,
        viewCountUpdateTime: 0
    });
    uint256 newTokenId = videos.push(_newVideo) - 1;
    videos[newTokenId].tokenId = newTokenId;
    videoIdToTokenId[_stringToBytes32(videoId)] = newTokenId;

    // Mint the video token and send to the owner.
    _mint(videoOwner, newTokenId);

    _initVideo(newTokenId, viewCount);

    return newTokenId;
  }

  /// @dev initialize the view count and viewCountUpdateTime for a video.
  /// @param tokenId whose video id is associated to.
  /// @param viewCount to updated.
  function _initVideo(uint256 tokenId, uint256 viewCount) internal {
    videos[tokenId].viewCount = viewCount;
    videos[tokenId].viewCountUpdateTime = uint64(now);
  }

  /// @dev get the view count for a video.
  /// @param videoId whose view count is being retrieved.
  function getVideoViewCount(string videoId)
      public view onlyBoardMembers
      returns (uint256) {
    _requireExistingVideo(videoId);
    return videos[getTokenId(videoId)].viewCount;
  }

  // @dev helper function in order to do mapping, obtained from
  // https://ethereum.stackexchange.com/questions/9142/how-to-convert-a-string-to-bytes32
  function _stringToBytes32(string memory source)
      internal pure returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
      return 0x0;
    }

    assembly {
      result := mload(add(source, 32))
    }
  }

  /// @dev Does a byte-by-byte lexicographical comparison of two strings.
  /// @param _a string one.
  /// @param _b string two.
  /// @return a negative number if `_a` is smaller, zero if they are equal
  /// and a positive numbe if `_b` is smaller.
  /// From https://github.com/ethereum/dapp-bin/blob/master/library/stringUtils.sol
  function _stringCompare(string memory _a, string memory _b)
      internal pure returns (int) {
    bytes memory a = bytes(_a);
    bytes memory b = bytes(_b);
    uint minLength = a.length;
    if (b.length < minLength) minLength = b.length;
    //@todo unroll the loop into increments of 32 and do full 32 byte comparisons
    for (uint i = 0; i < minLength; i ++)
      if (a[i] < b[i])
        return -1;
      else if (a[i] > b[i])
        return 1;
    if (a.length < b.length)
      return -1;
    else if (a.length > b.length)
      return 1;
    else
      return 0;
  }

  /// @dev Compares two strings and returns true iff they are equal.
  /// @param _a string one.
  /// @param _b string two.
  /// From https://github.com/ethereum/dapp-bin/blob/master/library/stringUtils.sol
  function _stringEqual(string memory _a, string memory _b)
      internal pure returns (bool) {
    return _stringCompare(_a, _b) == 0;
  }

}
