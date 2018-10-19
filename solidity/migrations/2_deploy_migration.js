
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
const SmartTokenAuthority = artifacts.require('SmartTokenAuthority');
const SmartTokenRING = artifacts.require('ERC223SmartToken')

COIN = 10 ** 18;

const CONF = {
    gasPrice: 10000000000,
    weight10Percent: 100000,
    // remember to change this.
    from: '0x4cc4c344eba849dc09ac9af4bff1977e44fc1d7e',
    registry_address: '0xf21930682df28044d88623e0707facf419477041',
}


module.exports = function (deployer, network) {

    // below will cause error when deploying contracts onto kovan
    // but ok on private chain like ganache
    if (network == 'kovan') {


        // deployer.deploy([
        //     // DeployAndTest,
        //     // SettingsRegistry,
        //     ContractIds,
        //     ContractFeatures,
        //     BancorFormula,
        //     WhiteList,
        //     EtherToken,
        //     [BancorGasPriceLimit, CONF.gasPrice],
        //     [RING, 'RING']
        // ])
        deployer.deploy(SmartTokenAuthority);
        deployer.deploy(ContractIds);
        deployer.deploy(ContractFeatures);
        deployer.deploy(BancorFormula);
        deployer.deploy(WhiteList);
        deployer.deploy(EtherToken);
        deployer.deploy(BancorGasPriceLimit, CONF.gasPrice);
        deployer.deploy(SmartTokenRING);
        deployer.deploy(BancorNetwork, CONF.registry_address).then(async () => {

            let ring = await SmartTokenRING.deployed();
            let smartTokenAuthority = await SmartTokenAuthority.deployed();
            await ring.setAuthority(smartTokenAuthority.address);
            let whiteList = await WhiteList.deployed();
            let etherToken = await EtherToken.deployed();
            let bancorNetwork = await BancorNetwork.deployed();
            let bancorGasPriceLimit = await BancorGasPriceLimit.deployed();
            let bancorFormula = await BancorFormula.deployed();
            let settingsRegistry = await SettingsRegistry.at(CONF.registry_address);

            let contractIds = await ContractIds.deployed();
            let contractFeatures = await ContractFeatures.deployed();

            let contractFeaturesId = await contractIds.CONTRACT_FEATURES.call();
            await settingsRegistry.setAddressProperty(contractFeaturesId, contractFeatures.address);
            console.log("LOGGING: address of settingsRegistry: ", settingsRegistry.address);

            await deployer.deploy(BancorConverter, ring.address, CONF.registry_address, 0, etherToken.address, CONF.weight10Percent, {gas: 7000000});
            console.log("LOGGING: address of bancorConverter: ", BancorConverter.address);
            let bancorConverter = await BancorConverter.deployed();
            await deployer.deploy(BancorExchange, ring.address, bancorNetwork.address, bancorConverter.address, {gas: 3000000});

            let bancorExchange = await BancorExchange.deployed();

            let gasPriceLimitId;
            let formulaId;
            let bancorNetworkId;


            formulaId = await contractIds.BANCOR_FORMULA.call();
            await settingsRegistry.setAddressProperty(formulaId, bancorFormula.address);
            gasPriceLimitId = await contractIds.BANCOR_GAS_PRICE_LIMIT.call();
            await settingsRegistry.setAddressProperty(gasPriceLimitId, bancorGasPriceLimit.address);
            bancorNetworkId = await contractIds.BANCOR_NETWORK.call();
            await settingsRegistry.setAddressProperty(bancorNetworkId, bancorNetwork.address);

            //do this to make SmartToken.totalSupply > 0
            await ring.changeCap(20 * 10**8 * COIN);
            await ring.issue(CONF.from, 12 * 10 **8 * COIN);
            // await smartTokenAuthority.setWhitelist(bancorConverter.address, true);
            await ring.transferOwnership(bancorConverter.address);
            await bancorConverter.acceptTokenOwnership();

            // await etherToken.deposit({value: 1 * COIN});
            // await etherToken.transfer(BancorConverter.address, 1 * COIN);
            await bancorConverter.updateConnector(etherToken.address, 100000, true, 12000 * COIN);

            await whiteList.addAddress(bancorExchange.address);
            await bancorConverter.setConversionWhitelist(whiteList.address);

            await bancorNetwork.registerEtherToken(etherToken.address, true);

            await bancorExchange.setQuickBuyPath([etherToken.address, ring.address, ring.address]);
            await bancorExchange.setQuickSellPath([ring.address, ring.address, etherToken.address]);

            console.log('SUCCESS!')
        })

    }
}