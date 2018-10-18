# Decentralized Exchange Based On Bancor Protocol

> this is a project forked from https://github.com/bancorprotocol/contracts.git and with high availability.

Big thanks to bancor team.

### Diffrence
we fix some bugs in master branch and add BancorExchange to make it more developer-friendly.

### How to buy ERC223SmartToken with ETH
```js
bancorExchange.buyRING(minReturn)
```
`minReturn` refers to the minimum amount of ERC223SmartToken you expected.

Note that it's a payable function, so give it a msg.value which greater than 0.


### how to change SmartToken back to ETH
```js
ERC223SmartToken.transfer(address(bancorExchange), amountOfSmartToken,  bytes(miniReturn))
```
`minReturn` here refers to the minimum amount of ETH you expected.

### Contracts' addresses on KOVAN
```js
RING: 0xee716e90ac3b65ad0a9641756db4b3c067caee64
SmartTokenAuthority: 0x71c899727ad8f341bc64684e5d82138fd3fd085d
ContractIds: 0xe5a669cb07f7f866dd8147049e7f6c6032d0b0e8
ContractFeatures: 0xfd7c68b58b392caca347e469bed569a272fb2309
BancorFormula: 0xe9e5943365b99b4099e1965d2786a99a94774bc5
Whitelist: 0x9a8c84007ab413e43453619d0b02b05d1306da62
EtherToken: 0xaf741411d69fd49268a4193100ef379058b507c9
BancorGasPriceLimit: 0xcb6bb52b6f640b057df554a497f9a8015bb1fcce
BancorNetwork: 0xa4c6bb122c76fb81f95068566d3e0768ad92325d
BancorConverter: 0x98e1646b1db6375c567f82e66b5bd30702f52d46
BancorExchange: 0x13b01baa7852f5528a0a1f5067f8251c925f2041
```

thanks for testing.
