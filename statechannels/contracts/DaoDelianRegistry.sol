pragma solidity ^0.5.3;
pragma experimental "ABIEncoderV2";

contract DaoDelianRegistry {

  /// @dev Events
  /* event ChannelStart(address indexed _owner, uint256 indexed _channelId, address[] _participants); */
  /* event ChannelEnd(address indexed _owner, uint256 indexed _channelId, bytes _state); */

  struct Channel {
    uint256 id;
    // is this needed?
    uint256 nonce;
    address validationContract;
    // TODO: outcome, stake alotment
  }

  /// @dev Definitions of parties and channels
  address[] participants;
  address[] channels;
  // TODO: game configs
}
