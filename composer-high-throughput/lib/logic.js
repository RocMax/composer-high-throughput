/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
 * Write your transction processor functions here
 */

const compositeIndexName = "participantId~deltaType~amount~txID"
/**
 * Sample transaction
 * @param {org.example.mynetwork.ChangeBalance} changeBalance
 * @transaction
 */
async function changeBalance(tx) {
    let txId = getNativeAPI().getTxID();
    let attributes = new Array(tx.sampleParticipant.participantId, tx.deltaType, tx.amount.toString(), txId);
    const nativeKey = getNativeAPI().createCompositeKey(compositeIndexName, attributes);
    await getNativeAPI().putState(nativeKey, new Uint8Array(1));
}

/**
 * Handle a transaction that returns an array of values.
 * @param {org.example.mynetwork.GetBalance} getBalance The getBalance transaction.
 * @returns {Double} All history value.
 * @transaction
 */
async function getBalance(tx) {
    let participantId = tx.sampleParticipant.participantId;
    let balance = tx.sampleParticipant.balance;
    let deltas = await getDeltas(participantId);
    deltas.forEach(delta => {
        balance += delta;
    });
    return balance;
}

/**
 * Get all deltas of participant by participantId.
 * @param {String} participantId Id of participant
 * @returns {Doubel[]} Array of deltas
 */
async function getDeltas(participantId) {
    let deltaResultsIterator = await getNativeAPI().getStateByPartialCompositeKey(compositeIndexName, [participantId]);
    let results = [];
    let responseRange;
    do {
        responseRange = await deltaResultsIterator.next();
        if (responseRange && responseRange.value) {
            let keyParts = getNativeAPI().splitCompositeKey(responseRange.value.getKey());
            switch (keyParts.attributes[1]) {
                case 'PLUS':
                    results.push(parseFloat(keyParts.attributes[2]));
                    break;
                case 'MINUS':
                    results.push(-parseFloat(keyParts.attributes[2]));
                    break;
                default:
                    // throw new Error('Invalid delta type.');
                    break;
            }
        }
    } while (!responseRange.done);
    await deltaResultsIterator.close();
    return results;
}

/**
 * Get all deltas of participant by participantId.
 * @param {org.example.mynetwork.Participant} participant participant to prune
 * @returns {Integer} amount of pruned deltas
 */
async function pruneOne(participant) {
    let deltaResultsIterator = await getNativeAPI().getStateByPartialCompositeKey(compositeIndexName, [participant.participantId]);
    let amount = 0;
    let responseRange;
    do {
        responseRange = await deltaResultsIterator.next();
        if (responseRange && responseRange.value) {
            let keyParts = getNativeAPI().splitCompositeKey(responseRange.value.getKey());
            switch (keyParts.attributes[1]) {
                case 'PLUS':
                    participant.balance += parseFloat(keyParts.attributes[2]);
                    break;
                case 'MINUS':
                    participant.balance -= parseFloat(keyParts.attributes[2]);
                    break;
                default:
                    throw new Error('Invalid delta type.')
                    break;
            }
            await getNativeAPI().deleteState(responseRange.value.getKey());
            amount++;
        }
    } while (!responseRange.done);
    await deltaResultsIterator.close();
    const participantRegistry = await getParticipantRegistry('org.example.mynetwork.SampleParticipant');
    await participantRegistry.update(participant);
    return amount;
}

/**
 * Purne all deltas of participant by participantId.
 * @param {org.example.mynetwork.Prune} prune Id of participant
 * @returns {Integer} Amount of deleted deltas
 * @transaction
 */
async function prune(tx) {
    let participant = tx.sampleParticipant;
    let result = await pruneOne(participant);
    return result;
}

/**
 * Purne all deltas of all participants
 * @param {org.example.mynetwork.PruneAll} pruneAll The pruneAll transaction.
 * @returns {String} Amount of deleted deltas
 * @transaction
 */
async function pruneAll() {
    const participantRegistry = await getParticipantRegistry('org.example.mynetwork.SampleParticipant');
    let participants = await participantRegistry.getAll();
    let numOfDelta = 0;
    let numOfParticipant = 0;
    for (const participant of participants) {
        let result = await pruneOne(participant);
        numOfParticipant++;
        numOfDelta += result;
    }
    let res = {
        numOfParticipant: numOfParticipant,
        numOfDelta: numOfDelta
    };
    return JSON.stringify(res);
}