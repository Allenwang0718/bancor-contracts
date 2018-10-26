const BancorConverter = artifacts.require('BancorConverter');
const BancorFormula = artifacts.require('BancorFormula');
const BancorGasPriceLimit = artifacts.require('BancorGasPriceLimit');
const EtherToken = artifacts.require('EtherToken');
const ContractFeatures = artifacts.require('ContractFeatures');
const SettingsRegistry = artifacts.require('SettingsRegistry');
const WhiteList = artifacts.require('Whitelist');
const BancorNetwork = artifacts.require('BancorNetwork');
const BancorExchange = artifacts.require('BancorExchange');
const ContractIds = artifacts.require('ContractIds');
const FeatureIds = artifacts.require('FeatureIds');
const DeployAndTest = artifacts.require('DeployAndTest');
const SmartTokenRING = artifacts.require('ERC223SmartToken')

COIN = 10 ** 18;

const CONF = {
    registry_address: '0x7050f7a4fa45b95997cd2158bfbe11137be24151',
    ring_address: '0x04ce3ad47581de61fab830654a17bda8968e973f',
    gasPrice: 10000000000,
    weight10Percent: 100000,
    // remember to change this.
    from: '0x4cc4c344eba849dc09ac9af4bff1977e44fc1d7e',
}


module.exports = function (deployer, network) {

    // below will cause error when deploying contracts onto kovan
    // but ok on private chain like ganache
    if (network != 'kovan') {
        return;
    }


    deployer.deploy(ContractIds);
    deployer.deploy(ContractFeatures);
    deployer.deploy(BancorFormula);
    deployer.deploy(WhiteList);
    deployer.deploy(EtherToken);
    deployer.deploy(BancorGasPriceLimit, CONF.gasPrice);
    deployer.deploy(BancorNetwork, CONF.registry_address).then(async () => {
        let contractIds = await ContractIds.deployed();
        let settingsRegistry = await SettingsRegistry.at(CONF.registry_address);
        let contractFeaturesId = await contractIds.CONTRACT_FEATURES.call();
        await settingsRegistry.setAddressProperty(contractFeaturesId, ContractFeatures.address);
    }).then(async () => {
        await deployer.deploy(BancorConverter, CONF.ring_address, CONF.registry_address, 0, EtherToken.address, CONF.weight10Percent, {gas: 8000000});
    }).then(async () => {
        await deployer.deploy(BancorExchange, BancorNetwork.address, BancorConverter.address, CONF.registry_address, {gas: 5000000});
    }).then(async () => {
        let bancorExchange = await BancorExchange.deployed();
        let settingsRegistry = await SettingsRegistry.at(CONF.registry_address);

        let whiteList = await WhiteList.deployed();
        let etherToken = await EtherToken.deployed();
        let bancorNetwork = await BancorNetwork.deployed();
        let bancorGasPriceLimit = await BancorGasPriceLimit.deployed();
        let bancorFormula = await BancorFormula.deployed();

        let contractIds = await ContractIds.deployed();

        let bancorConverter = await BancorConverter.deployed();

        // register
        let ring = await SmartTokenRING.at(CONF.ring_address);
        let ringId = await bancorExchange.CONTRACT_RING_ERC20_TOKEN.call();
        await settingsRegistry.setAddressProperty(ringId, CONF.ring_address);

        // let contractFeaturesId = await contractIds.CONTRACT_FEATURES.call();
        // await settingsRegistry.setAddressProperty(contractFeaturesId, contractFeatures.address);

        let formulaId = await contractIds.BANCOR_FORMULA.call();
        await settingsRegistry.setAddressProperty(formulaId, bancorFormula.address);
        let gasPriceLimitId = await contractIds.BANCOR_GAS_PRICE_LIMIT.call();
        await settingsRegistry.setAddressProperty(gasPriceLimitId, bancorGasPriceLimit.address);
        let bancorNetworkId = await contractIds.BANCOR_NETWORK.call();
        await settingsRegistry.setAddressProperty(bancorNetworkId, bancorNetwork.address);

        //do this to make SmartToken.totalSupply > 0
        await ring.changeCap(20 * 10**8 * COIN);
        await ring.issue(CONF.from, 12 * 10 **8 * COIN);
        // await smartTokenAuthority.setWhitelist(bancorConverter.address, true);
        await ring.transferOwnership(bancorConverter.address);
        await bancorConverter.acceptTokenOwnership();

        // await etherToken.deposit({value: 1 * COIN});
        // await etherToken.transfer(BancorConverter.address, 1 * COIN);
        await bancorConverter.updateConnector(etherToken.address, 100000, true, 1200 * COIN);

        await whiteList.addAddress(bancorExchange.address);
        await bancorConverter.setConversionWhitelist(whiteList.address);

        await bancorNetwork.registerEtherToken(etherToken.address, true);

        await bancorExchange.setQuickBuyPath([etherToken.address, CONF.ring_address, CONF.ring_address]);
        await bancorExchange.setQuickSellPath([CONF.ring_address, CONF.ring_address, etherToken.address]);

        console.log('SUCCESS!')
    })

}