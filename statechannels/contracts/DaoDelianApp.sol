pragma solidity 0.5.7;
pragma experimental "ABIEncoderV2";

/* import "@counterfactual/contracts/contracts/CounterfactualApp.sol"; */


/* contract DaoDelianApp is CounterfactualApp { */
contract DaoDelianApp {

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
    // TODO: Reflect the state structure defined in board
    bool outcomeBool;
    bool snapshotBool;
    uint256[][] outcome;
    /// @dev BYOG needs data abstraction
    ///      IDEA, setup matrix based games, and simple bool outcomes
    uint256[][] snapshot;
  }

  struct Action {
    ActionType actionType;
    uint256 number;
    bytes32 salt;
    bytes32 commitHash;
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

  /* function isStateTerminal(bytes calldata encodedState)
    external
    pure
    returns (bool)
  {
    AppState memory state = abi.decode(encodedState, (AppState));
    return state.winner != GAME_IN_PROGRESS;
  } */

  /* function getTurnTaker(
    bytes calldata encodedState, address[] calldata signingKeys
  )
    external
    pure
    returns (address)
  {
    AppState memory state = abi.decode(encodedState, (AppState));
    return signingKeys[state.turnNum % 2];
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

  /* function resolve(bytes calldata encodedState, bytes calldata terms) external pure {
  } */

  /* function playMove(
    AppState memory state,
    address participantId,
    uint256 x,
    uint256 y
  )
    internal
    pure
    returns (AppState memory)
  {
    return state;
  } */
/*
  function assertBoardIsFull(AppState memory preState)
    internal
    pure
  {
    for (uint256 i = 0; i < 3; i++) {
      for (uint256 j = 0; j < 3; j++) {
        require(
          preState.board[i][j] != 0, "assertBoardIsFull: square is empty"
        );
      }
    }
  }

  function assertWin(
    uint256 playerId,
    AppState memory state,
    WinClaim memory winClaim
  )
    internal
    pure
  {
    uint256 expectedSquareState = playerId + 1;
    if (winClaim.winClaimType == WinClaimType.COL) {
      require(
        state.board[winClaim.idx][0] == expectedSquareState, "Win Claim not valid"
      );
      require(
        state.board[winClaim.idx][1] == expectedSquareState, "Win Claim not valid"
      );
      require(
        state.board[winClaim.idx][2] == expectedSquareState, "Win Claim not valid"
      );
    } else if (winClaim.winClaimType == WinClaimType.ROW) {
      require(
        state.board[0][winClaim.idx] == expectedSquareState, "Win Claim not valid"
      );
      require(
        state.board[1][winClaim.idx] == expectedSquareState, "Win Claim not valid"
      );
      require(
        state.board[2][winClaim.idx] == expectedSquareState, "Win Claim not valid"
      );
    } else if (winClaim.winClaimType == WinClaimType.DIAG) {
      require(state.board[0][0] == expectedSquareState, "Win Claim not valid");
      require(state.board[1][1] == expectedSquareState, "Win Claim not valid");
      require(state.board[2][2] == expectedSquareState, "Win Claim not valid");
    } else if (winClaim.winClaimType == WinClaimType.CROSS_DIAG) {
      require(state.board[2][0] == expectedSquareState, "Win Claim not valid");
      require(state.board[1][1] == expectedSquareState, "Win Claim not valid");
      require(state.board[0][2] == expectedSquareState, "Win Claim not valid");
    }
  } */

}
