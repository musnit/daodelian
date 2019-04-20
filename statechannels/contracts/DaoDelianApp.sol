pragma solidity ^0.5.3;
pragma experimental "ABIEncoderV2";

/* import "zeppelin-solidity/contracts/ownership/Ownable.sol"; */
/* import "zeppelin-solidity/contracts/lifecycle/Pausable.sol"; */
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
    START_PHASE,
    COMMIT_HASHED,
    COMMIT_REVEAL,
    REVEAL
  }

  enum Stage {
    INITIALIZE,
    STAKING,
    COMMITTING,
    REVEALING,
    DONE
  }

  struct AppState {
    address[] participants;
    address validationContract;
    Stage stage;
    uint256 turnNum;
    // Reflect the state structure defined in rules, array is used to be generic
    uint256[] outcome;
    /// @dev setup is for matrix based games, and simple bool outcomes
    uint256[] snapshot;
  }

  struct Action {
    ActionType actionType;
    uint256 number;
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

  function isStateTerminal(bytes calldata encodedState)
    external
    pure
    returns (bool)
  {
    AppState memory state = abi.decode(encodedState, (AppState));
    return state.stage == Stage.DONE;
  }

  /// TODO: return current player address, based on previous committed data
  /* function getTurnTaker(
    bytes calldata encodedState, address[] calldata signingKeys
  )
    external
    pure
    returns (address)
  {
    AppState memory state = abi.decode(encodedState, (AppState));
    /// TODO: TEST!! based on players
    return signingKeys[state.turnNum % state.participants.length];
  } */

  /* function applyAction(
    bytes calldata encodedState, bytes calldata encodedAction
  )
    external
    pure
    returns (bytes memory)
  {
    AppState memory state = abi.decode(encodedState, (AppState));
    Action memory action = abi.decode(encodedAction, (Action));

    AppState memory postState;
    postState.turnNum += 1;

    return abi.encode(postState);
  } */

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
