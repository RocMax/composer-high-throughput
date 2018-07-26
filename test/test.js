const network = require('./network');
const uuidv4 = require('uuid/v4');
const { PerformanceObserver, performance } = require('perf_hooks');


async function highThroughputTest(num, id, balance) {
    await network.addParticipant(id, balance);
    console.log(`Created new participant ID: ${id} Balance: ${balance}`)
    let promises = [];
    for (let index = 0; index < num; index++) {
        let value = Math.random();
        let deltaType = Math.random() > 0.5 ? 'PLUS' : 'MINUS';
        if (deltaType === 'PLUS') {
            balance += value;
        } else {
            balance -= value;
        }
        promises.push(network.changeBalance(id, deltaType, value));
        // console.log(`Delta type: ${deltaType} Amount: ${value} `)
    }
    console.log(`Balance should be changed for ${num} times, after that balance should be ${balance}`)
    let t0 = performance.now();
    console.log(`Process start at ${new Date(Date.now())}`)
    await Promise.all(promises);
    let t1 = performance.now();
    console.log(`Send ${num} change request cost ${t1 - t0} milliseconds`);
    // console.log('wait 100 sec')
    // const sleep =ms => new Promise(resolve => setTimeout(resolve, ms));
    // await sleep(100000);
    console.log(`Inquire balance of participant ID: ${id} in blockchain.`)
    let result = await network.getBalance(id);
    console.log(`Inquire succeed, Balance of participant ID: ${id} is ${result}`)
};

async function pruneTest(id) {
    let t0 = performance.now();
    let result = await network.pruneDeltasById(id);
    let t1 = performance.now();
    console.log(`Purned ${result} deltas in ${t1 - t0} milliseconds`);
    let balance = await network.getBalance(id);
    console.log(`Inquire succeed, Balance of participant ID: ${id} is ${balance}`)
    console.log(`Purne again`)
    result = await network.pruneDeltasById(id);
    console.log(`Purned ${result} deltas`);
};

async function pruneAllTest() {
    let t0 = performance.now();
    let str = await network.pruneAll();
    let t1 = performance.now();
    let result = JSON.parse(str);
    console.log(`Purned ${result.numOfDelta} Deltas of ${result.numOfParticipant} Participants in ${t1 - t0} milliseconds`);
}


async function pruneFailedTest(num, id, balance) {
    await network.addParticipant(id, balance);
    console.log(`Created new participant ID: ${id} Balance: ${balance}`)
    let promises = [];
    let oldBalance = balance;
    let balanceBeforeRollback;
    for (let index = 0; index < num; index++) {
        let value = Math.random();
        let deltaType = Math.random() > 0.5 ? 'PLUS' : 'MINUS';
        if (index === num - 1) {
            deltaType = 'ERROR';
            balanceBeforeRollback = balance;
        }
        if (deltaType === 'PLUS') {
            balance += value;
        } else {
            balance -= value;
        }
        promises.push(network.changeBalance(id, deltaType, value));
    }
    console.log(`Balance should be changed for ${num - 1} times then throw an Error, after changes balance should be: ${balanceBeforeRollback} ,  if rollback successfully balance should be ${oldBalance}`)
    let t0 = performance.now();
    console.log(`Process start at ${new Date(Date.now())}`)
    try {
        await Promise.all(promises);
    } catch (error) {
        console.log(error)
    }
    let t1 = performance.now();
    console.log(`Send ${num} change request cost ${t1 - t0} milliseconds`);
    console.log(`Send Prune transaction`);
    try {
        await network.pruneDeltasById(id);
    } catch (error) {
        console.log(error)
    }
    console.log(`Inquire balance of participant ID: ${id} without delta in blockchain.`)
    let result = await network.getBalanceWithoutDelta(id);
    console.log(`Inquire succeed, Balance of participant ID: ${id} without Delta is ${result}`)
};


(async () => {
    let num = 5;
    let id = uuidv4();
    let balance = 0
    // try {
    console.log('====================================')
    console.log('High throughput test')
    console.log('====================================')
    await highThroughputTest(num, id, balance);
    await pruneTest(id);
    console.log('====================================')
    console.log('PruneAll test')
    console.log('====================================')
    id = uuidv4();
    await highThroughputTest(num, id, balance);
    id = uuidv4();
    await highThroughputTest(num, id, balance);
    try {
        await pruneAllTest();
    } catch (error) {
        console.log(error)
    }
    console.log('====================================')
    console.log('PruneFailed test')
    console.log('====================================')
    id = uuidv4();
    await pruneFailedTest(num, id, balance);
    console.log('====================================')
    console.log('Reset network')
    console.log('====================================')
    try {
        await network.resetNetwork();
    } catch (error) {
        console.log(error)
    }
    process.exit(0);
})();

