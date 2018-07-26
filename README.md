# Composer High Throughput 

> High throughput business network based on Hyperleder Composer.

## Introduction

This business network defines:

**Participant** `SampleParticipant`

**Transaction** `ChangeBalance` `Prune` `PruneAll`

**Read-only Transaction** `GetBalance`

`SampleParticipant` has a property `balance`.

Submit `ChangeBalance` transaction will change the balance of SampleParticipant. Network stores the delta value with `CompositeKey` instead of changes balance directly.

Submit `Prune` transaction will caulcate all deltas of SampleParticipant merge the value into balance and then delete all CompositeKey.

Submit `PruneAll` transaction will prune all SampleParticipant.

Submit `GetBalance` transaction will read balance and all deltas of SampleParticipant and calculate them then return a realtime value of balance. This transaction will not write any data into the ledger.

## Test 

* step 1

    Run `npm install` in `/composer-high-throughput` and `/test`

* step 2

    ```
    cd test && ./restart.sh && node test.js
    ```
