pragma solidity ^0.4.14;
contract HelloWorld {
    uint a = 0;
    function set(uint b) public {
        a = b;
    }
    function get() constant public returns (uint){
        return a;
    }
}