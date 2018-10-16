const BancorConverter = artifacts.require('BancorConverter');
const BancorInitial = require('./helpers/BancorInitial');

const COIN = 10 ** 18;

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

contract('test getPurchaseRequire and getPurchaseReturn', async (accounts) => {

    let bancorConverter;
    let etherToken;
    let count = 0;

    before('deploy contracts', async () => {
        let initial = await BancorInitial.initBancor(accounts);
        bancorConverter = initial.bancorConverter;
        etherToken = initial.etherToken;
    })


    it('test relationship between purchaseReturn and purchaseRequire', async (done) => {
        // context.timeout(30000000);
        setTimeout(async () => {
            try {
                for (let ethHad = 1; ethHad <= 100000000 * COIN; ethHad += getRandomInt(1000 * COIN)) {
                    let ringReturn = await bancorConverter.getPurchaseReturn(etherToken.address, ethHad);
                    let ethRequire = await bancorConverter.getPurchaseRequire(etherToken.address, ringReturn);
                    let bias = ethHad - ethRequire.valueOf();
                    count++;
                    console.log(count, "st count: the ethHad is ", ethHad);
                    console.log(count, "st count: the bias is ", bias);
                    assert.equal(bias, 0)
                }
            } catch (err) {
                throw new Error("bias is not zero. done");
            }
        }, 3000);

    })
})
