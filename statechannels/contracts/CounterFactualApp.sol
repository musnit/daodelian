pragma solidity ^0.5.3;

/// @dev this is taken from @counterfactual/contracts/contracts/CounterfactualApp.sol
///      however issues of naming on interface are breaking the usage, idk why
interface CounterfactualApp {

  function isStateTerminal(bytes calldata encodedState)
    external
    pure
    returns (bool);

  function getTurnTaker(bytes calldata, address[] calldata)
    external
    pure
    returns (address);

  function applyAction(bytes calldata, bytes calldata)
    external
    pure
    returns (bytes memory);

  // NOTE: TODO needs to be generic terms!
  function resolve(bytes calldata, bytes calldata)
    external
    pure
    returns (bytes memory);

}
