# Definitions
- Match -> distinct game series, may be one game, best of (n), or (n) repeating
- Game -> single instance of game within a match. Result: Win, Lose, Draw, Token Gain / Loss
- Participation -> the way in which individual members of a DAO contribute to the decision process (e.g. Dictator / Democracy)
- Mechanism -> the way that a decision is reached (type of voting system)
- Proposal / Proposed Decision -> a potential future game state submitted for decision making
- Move -> a discrete change in game state created by a DAO
- Committed Decision -> the selected proposal, ready to be submitted to the game contract. May not be reversed by the DAO but may not yet be executed / revealed by the game engine (e.g. in a simultaneous reveal situation)
- Decision -> one round of decision making, from vote distribution, proposal, to commitment, execution

# Doing in hackathon
1) Participation
    - Dictatorship
    - Democracy
2) Mechanism
    - Linear voting
    - Fibratic voting
    - 1 account 1 vote
    - 25 votes per turn, account based, no decay (maybe)
3) Proposals
    - open to all team members
    - no limits

# Composition of Intelligence Structures
_This is a partial list. The more possible contributions we can assemble, the greater success our experiments will have._
1) Participation
    - Dictator
        - constant
        - rolling
    - Democracy
        - Quorum
    - Delegation
        - Selected / elected members
2) Mechanism (not applicable to dictatorship)
    - Voting structure
        - linear voting
        - quadratic voting
        - fibratic voting
        - token based - internal (game specific)
        - token based - external (ETH / ERC20)
        - ranking
    - Vote distribution
        - even distribution
        - random distribution
            - upper bound
            - lower bound
    - Voice points
        - single use votes
        - limited circulation votes (n uses)
        - decaying votes
            - time based
            - decision epochs
        - permanently circulating votes
            - fixed supply
            - inflationary
            - peer to peer
            - circulate through central pool
3) Proposals
    - designated proposers
    - open propositions
    - cost to propose
    - stake to propose
    - proposal limit
