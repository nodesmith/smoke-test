pragma solidity ^0.4.14;
contract HelloWorld {
    uint a = 5;
    event ValueChanged(uint newValue);

    function set(uint b) public {
        a = b;
        ValueChanged(a);
    }

    function get() constant public returns (uint){
        return a;
    }
}