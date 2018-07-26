const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

const namespace = 'org.example.mynetwork'
const adminCardName = 'admin@composer-high-throughput'

async function addParticipant(id, balance) {
    let connection = new BusinessNetworkConnection();
    await connection.connect(adminCardName);
    let factory = connection.getBusinessNetwork().getFactory();
    let participant = factory.newResource(namespace, 'SampleParticipant', id)
    participant.balance = balance;
    let participantRegistry = await connection.getParticipantRegistry(namespace + '.SampleParticipant');
    await participantRegistry.add(participant);
    await connection.disconnect();
}

async function changeBalance(id, deltaType, amount) {
    let connection = new BusinessNetworkConnection();
    await connection.connect(adminCardName);
    let factory = connection.getBusinessNetwork().getFactory();
    let tx = factory.newTransaction(namespace, 'ChangeBalance');
    tx.sampleParticipant = factory.newRelationship(namespace, 'SampleParticipant', id);
    tx.deltaType = deltaType;
    tx.amount = amount;
    await connection.submitTransaction(tx);
    await connection.disconnect();
}

async function getBalance(id) {
    let connection = new BusinessNetworkConnection();
    await connection.connect(adminCardName);
    let factory = connection.getBusinessNetwork().getFactory();
    let tx = factory.newTransaction(namespace, 'GetBalance');
    tx.sampleParticipant = factory.newRelationship(namespace, 'SampleParticipant', id);
    let results = await connection.submitTransaction(tx);
    await connection.disconnect();
    return results;
}

async function getBalanceWithoutDelta(id) {
    let connection = new BusinessNetworkConnection();
    await connection.connect(adminCardName);
    let participantRegistry = await connection.getParticipantRegistry(namespace + '.SampleParticipant');
    let participant = await participantRegistry.get(id);
    await connection.disconnect();
    return participant.balance;
}

async function pruneDeltasById(id) {
    let connection = new BusinessNetworkConnection();
    await connection.connect(adminCardName);
    let factory = connection.getBusinessNetwork().getFactory();
    let tx = factory.newTransaction(namespace, 'Prune');
    tx.sampleParticipant = factory.newRelationship(namespace, 'SampleParticipant', id);
    let result = await connection.submitTransaction(tx);
    await connection.disconnect();
    return result;
}

async function pruneAll() {
    let connection = new BusinessNetworkConnection();
    await connection.connect(adminCardName);
    let factory = connection.getBusinessNetwork().getFactory();
    let tx = factory.newTransaction(namespace, 'PruneAll');
    let result = await connection.submitTransaction(tx);
    await connection.disconnect();
    return result;
}


async function resetNetwork(){
    let adminConnection = new AdminConnection();
    await adminConnection.connect(adminCardName)
    await adminConnection.reset('composer-high-throughput')
}

module.exports.addParticipant = addParticipant
module.exports.changeBalance = changeBalance
module.exports.getBalance = getBalance
module.exports.pruneDeltasById = pruneDeltasById
module.exports.pruneAll = pruneAll
module.exports.getBalanceWithoutDelta = getBalanceWithoutDelta
module.exports.resetNetwork=resetNetwork
