pragma solidity ^0.5.3;
pragma experimental "ABIEncoderV2";

import "./SafeMath.sol";
import "./CounterfactualApp.sol";

contract DaoDelianApp is CounterfactualApp  {
/* contract DaoDelianApp { */
  using SafeMath for uint256;

  /// @dev Events -- Disregarded for state transactions, stored for start & end state
  event ChannelStart(address indexed _owner, uint256 indexed _channelId, address[] _participants);
  event ChannelEnd(address indexed _owner, uint256 indexed _channelId, bytes _state);

  /// @dev Action type keeps track of phase cycle order, these are in order of execution
  enum ActionType {
    PRECOMMIT,
    REVEAL
  }

  enum Stage {
    INITIALIZE,
    STAKING,
    COMMIT_REVEAL,
    DONE
  }

  struct AppState {
    address[] participants;
    address validationContract;
    Stage stage;
    uint256 currentTurnNum;
    /// @dev setup is for matrix/array based games
    // Reflect the state structure defined in rules, array is used to be generic
    // commitHash is generic hash of a turn or set of turns data, salted
    // salts are stored in order directly with the commit hashes, and assigned upon reveal phase
    bytes32[] commitHashes;
    bytes32[] salts;
    // enables out of order turns, required for validation of precommit, helpful for timeout & default state change
    address[] committers;
  }

  struct Action {
    ActionType actionType;
    address callee;
    uint256 turnNum;
    bytes32 salt;
    bytes32 commitHash;
  }

  address public owner;

  constructor() public {
    owner = msg.sender;
  }

  function initialize(
      address _validationContract,
      address[] memory _participants
    )
      public
      returns (bytes memory)
    {
      AppState memory initState;
      initState.validationContract = _validationContract;
      initState.participants = _participants;
      initState.stage = Stage.INITIALIZE;

      // TODO: Generate nonce!
      uint256 channelId = 234;

      emit ChannelStart(owner, channelId, _participants);

      return abi.encode(initState);
    }

  function getRandomSalt(uint256 num1, uint256 num2)
    public
    pure
    returns (bytes32)
  {
    require(
      num1 != 0 && num2 != 0,
      "Numbers passed in cannot equal 0"
      );
    return keccak256(abi.encodePacked(num1 * num2));
  }

  function getHashedValue(bytes32 _salt, string memory _value, address _sender) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(_value, _salt, _sender));
  }

  /// @dev Check if inputs match original hash
  function isHashValueValid(bytes32 _salt, string memory _value, address _sender, bytes32 _hashedMessage) public view returns (bool) {
    return this.getHashedValue(_salt, _value, _sender) == _hashedMessage;
  }

  function getAbiEncodeAction(bytes32 _data) public pure returns (bytes memory) {
    Action memory tmp;
    tmp.actionType = ActionType.PRECOMMIT;
    // TODO: this shouldn't come from here
    tmp.turnNum = 1;
    tmp.commitHash = _data;
    return abi.encode(tmp);
  }

  function getAbiEncodeState(bytes32[] memory _commitHashes) public pure returns (bytes memory) {
    AppState memory tmp;
    tmp.stage = Stage.COMMIT_REVEAL;
    tmp.currentTurnNum = 1;
    // tmp.commitHashes = _commitHashes;
    tmp.participants;
    tmp.salts;
    tmp.committers;

    if (_commitHashes.length > 0) tmp.commitHashes = _commitHashes;
    return abi.encode(tmp);
  }

  function isStateTerminal(bytes calldata encodedState)
    external
    pure
    returns (bool)
  {
    AppState memory state = abi.decode(encodedState, (AppState));
    return state.stage == Stage.DONE;
  }

  /// @dev returns current player address, based on previous committed data
  function getTurnTaker(
    bytes calldata encodedState
  )
    external
    pure
    returns (address)
  {
    AppState memory state = abi.decode(encodedState, (AppState));
    return state.participants[state.currentTurnNum];
  }

  function applyAction(
    bytes calldata encodedState,
    bytes calldata encodedAction,
    address[] calldata coms
    // string calldata value,
    // address participant
  )
    external
    pure
    returns (bytes memory)
  {
    AppState memory postState = abi.decode(encodedState, (AppState));
    Action memory action = abi.decode(encodedAction, (Action));

    // TODO:
    /* require(this.getTurnTaker(msg.sender), "Not your turn"); */

    // - if precommit, check only for data and store in returned state
    // - if reveal, check state hash validity (based on salt, sender, data)

    /// @dev Data PRECOMMIT Phase, allowing all subsequent parties to precommit data
    // no validity is needed to be proved, just require precommit values
    // requires that we keep track of participants, active participant ID
    // TODO: Check that there isn't a precommited state at this turn num and salt!
    // if (
    //   action.actionType == ActionType.PRECOMMIT &&
    // //   postState.commitHashes[action.turnNum].length == 0 &&
    // //   action.salt.length == 0 &&
    //   action.commitHash.length > 0
    // ) {
    //   postState.committers[action.turnNum] = callee;
    //   postState.commitHashes[action.turnNum] = keccak256(encodedAction);
    //   postState.currentTurnNum = action.turnNum.add(1);
    // }
    // postState.committers[action.turnNum] = participant;
    // address[] memory coms;
    // coms[action.turnNum] = participant;
    postState.committers = coms;
    // postState.commitHashes[action.turnNum] = keccak256(abi.encodePacked(encodedAction));
    postState.currentTurnNum = action.turnNum.add(1);

    /// @dev Data REVEAL Phase, Check new data and validate matches previous submission
    // no validity is needed to be proved, just commit to state
    // TODO: Check that there isn't a precommited state at this turn num and salt!
    // if (
    //   action.actionType == ActionType.REVEAL &&
    //   action.salt.length == 0 &&
    //   action.commitHash.length > 0
    // ) {
    //   // TODO: change the msg sender to previous member
    //   require(
    //     this.isHashValueValid(
    //       action.salt,
    //       value,
    //       callee,
    //       postState.commitHashes[action.turnNum]
    //     ),
    //     "precommit data hash invalid"
    //   );
    //   postState.salts[action.turnNum] = action.salt;
    // }

    return abi.encode(postState);
  }

  /* function resolve(bytes calldata encodedState, Transfer.Terms calldata terms)
    external
    pure
    returns (Transfer.Transaction memory)
  {
    AppState memory state = abi.decode(encodedState, (AppState));

    uint256[] memory amounts = new uint256[](2);
    address[] memory to = new address[](2);
    to[0] = state.playerAddrs[0];
    to[1] = state.playerAddrs[1];
    bytes32 expectedCommitHash = keccak256(
      abi.encodePacked(state.salt, state.playerFirstNumber)
    );
    if (expectedCommitHash == state.commitHash) {
      amounts = getWinningAmounts(
        state.playerFirstNumber, state.playerSecondNumber, terms.limit
      );
    } else {
      amounts[0] = 0;
      amounts[1] = terms.limit;
    }

    bytes[] memory data = new bytes[](2);

    return Transfer.Transaction(
      terms.assetType,
      terms.token,
      to,
      amounts,
      data
    );
  } */

}
