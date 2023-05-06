/**
 *Submitted for verification at Etherscan.io on 2022-11-04
*/

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

contract JoKenPo {

    enum Options { NONE, ROCK, PAPER, SCISSORS }//0, 1, 2, 3

    Options private choice1 = Options.NONE;
    address private player1;
    string public result = "";

    address payable private immutable owner;

    constructor() {
        owner = payable(msg.sender);
    }

    function finishGame(string memory newResult, address winner) private {
        address contractAddress = address(this);
        payable(winner).transfer((contractAddress.balance / 100) * 90);
        owner.transfer(contractAddress.balance);
        result = newResult;
        player1 = address(0);
        choice1 = Options.NONE;
    }

    function getBalance() public view returns(uint) {
        require(owner == msg.sender, "You can't view the contract's balance.");
        return address(this).balance;
    }

    function play(Options newChoice) public payable  {
        require(newChoice != Options.NONE, "Invalid choice");
        require(player1 != msg.sender, "Wait the another player.");
        require(msg.value >= 0.01 ether, "Invalid bid.");

        if(choice1 == Options.NONE){
            player1 = msg.sender;
            choice1 = newChoice;
            result = "Player 1 choose his/her option. Waiting player 2.";
        }
        else if(choice1 == Options.ROCK && newChoice == Options.SCISSORS)
            finishGame("Rock breaks scissors. Player 1 won.", player1);
        else if(choice1 == Options.PAPER && newChoice == Options.ROCK)
            finishGame("Paper wraps rock. Player 1 won.", player1);
        else if(choice1 == Options.SCISSORS && newChoice == Options.PAPER)
            finishGame("Scissors cuts paper. Player 1 won.", player1);
        else if(choice1 == Options.SCISSORS && newChoice == Options.ROCK)
            finishGame("Rock breaks scissors. Player 2 won.", msg.sender);
        else if(choice1 == Options.ROCK && newChoice == Options.PAPER)
            finishGame("Paper wraps rock. Player 2 won.", msg.sender);
        else if(choice1 == Options.PAPER && newChoice == Options.SCISSORS)
            finishGame("Scissors cuts paper. Player 2 won.", msg.sender);
        else {
            result = "Draw game. The prize was doubled";
            player1 = address(0);
            choice1 = Options.NONE;
        }
    }
}