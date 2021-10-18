import { agent } from "supertest";
import { createServer } from '../server/server.js';
import memoryStorage from '../server/memory_storage.js';
import assert from 'assert';
const port = 5005;




const baseLocation = '/api/ledger';
const baseUrl = `http://localhost:${port}${baseLocation}`;

const app = createServer();
let server;

let client = agent(baseUrl);

describe("Entries tests",function() {

  beforeEach( function (done) {
    memoryStorage.addBucket('accounts-receivable-principal');
    memoryStorage.addBucket('accounts-receivable-interest');
    memoryStorage.addBucket('income-interest');
    memoryStorage.addBucket('future-receivable-principal');
    memoryStorage.addBucket('loan-commitment-liability');
    memoryStorage.addBucket('cash');
    
    server = app.listen(port, done);
  });
  
  afterEach( function (done) {
    memoryStorage.reset();
    server.close( function () { done(); } );
  });

  it("should create a new ledger entry pair", function(done){
    const debitBucketId = 'future-receivable-principal';
    const creditBucketId = 'loan-commitment-liability';

    const payload = {
      loanId: '123',
      createdAt: '2021-10-17' ,
      effectiveDate: '2021-10-18',
      value: 10,
      debitBucket: debitBucketId,
      creditBucket: creditBucketId,
    };

    client
      .post('/entries')
      .send( payload )
      .expect(201)
      .end( (err,res) => {
        if( err ) { 
          console.log(res.body);
          return done(err);
         }
        done();
      } )
    ;
  });

  it("should not accept parameters incompatible with schema", function(done){
    const payload = {
      loanId: '123',
      createdAt: 'new Date( 2021, 10, 17 )',
      effectiveDate: 'new Date( 2021, 10, 18 )',
      value: '123.0',
      debitBucket: 1,
      creditBucket: 1,
    };

    client
      .post('/entries')
      .send( payload )
      .expect(400)
      .end( (err,res) => {
        if( err ) { 
          console.log(res.body);
          return done(err);
         }
        done();
      } )
    ;
  });

  it("should not create a new ledger entry pair with an invalid bucket id", function(done){
    const debitBucketId = 'future-receivable-principalXXX';
    const creditBucketId = 'loan-commitment-liabilityYYY';

    const payload = {
      loanId: '123',
      createdAt: '2021-10-17' ,
      effectiveDate: '2021-10-18',
      value: 123.0,
      debitBucket: debitBucketId,
      creditBucket: creditBucketId,
    };

    client
      .post('/entries')
      .send( payload )
      .expect(409)
      .end( (err,res) => {
        if( err ) { 
          console.log(res.body);
          return done(err);
         }
        done();
      } )
    ;
  });

  it("should create a few new ledger entry pairs and return them", async ()=>{
    const debitBucketId = 'future-receivable-principal';
    const creditBucketId = 'loan-commitment-liability';
    const loanId = '123';
    const payload = {
      loanId: loanId,
      createdAt: '2021-10-17' ,
      effectiveDate: '2021-10-18',
      value: 123.0,
      debitBucket: debitBucketId,
      creditBucket: creditBucketId,
    };

    const expectedResult = 
    { 
      entries: [
        {
          createdAt: payload.createdAt,
          effectiveDate: payload.effectiveDate,
          value: 123.0,
          bucket: debitBucketId,
        },
        {
          createdAt: payload.createdAt,
          effectiveDate: payload.effectiveDate,
          value: -123.0,
          bucket: creditBucketId,
        },
      ]
    }

    const postRes = await client
      .post('/entries')
      .send( payload )
    ;
    const getRes = await client
      .get(`/entries?loanId=${loanId}`)
      .expect(200)
    ;
    assert.equal(getRes.body.data.entries.length, 2);

    assert.deepEqual(getRes.body.data, expectedResult);
  });

  it("should create a few new ledger entry pairs and return the sum of the bucket", async ()=>{
    const debitBucketId = 'future-receivable-principal';
    const creditBucketId = 'loan-commitment-liability';
    const loanId = '123';
    const payload = {
      loanId: loanId,
      createdAt: '2021-10-17' ,
      effectiveDate: '2021-10-18',
      value: 123.0,
      debitBucket: debitBucketId,
      creditBucket: creditBucketId,
    };

    await client
      .post('/entries')
      .send( payload )
    ;
    await client
      .post('/entries')
      .send( payload )
    ;
    const getRes = await client
      .get(`/buckets?loanId=${loanId}&bucketids=${debitBucketId},${creditBucketId}`)
      .expect(200)
    ;
    const expectedResult = {};
    expectedResult[debitBucketId] = payload.value * 2;
    expectedResult[creditBucketId] = -payload.value * 2;

    
    assert.deepEqual(getRes.body, expectedResult);

  });


});



