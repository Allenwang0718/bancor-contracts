const BancorConverter = artifacts.require('BancorConverter');
const BancorInitial = require('./helpers/BancorInitial');

const COIN = 10 ** 18;

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

contract('test getPurchaseRequire and getPurchaseReturn', async (accounts) => {

    let bancorConverter;
    let etherToken;

    before('deploy contracts', async () => {
        let initial = await BancorInitial.initBancor(accounts);
        bancorConverter = initial.bancorConverter;
        etherToken = initial.etherToken;
    })

    let count = 0;
    it('test relationship between purchaseReturn and purchaseRequire', async () => {
        for (let ethHad = 1; ethHad <= 100000 * COIN; ethHad += getRandomInt(COIN)) {
            let ringReturn = await bancorConverter.getPurchaseReturn(etherToken.address, ethHad);
            let ethRequire = await bancorConverter.getPurchaseRequire(etherToken.address, ringReturn);
            let bias = ethHad - ethRequire.valueOf();
            count++;

            console.log(count, "st count: the bias is ", bias);

        }
    })
})
