import { agent } from "supertest";
import { createServer } from '../server/server.js';
import memoryStorage from '../server/memory_storage.js';

const port = 5005;




const baseLocation = '/api/ledger/buckets';
const baseUrl = `http://localhost:${port}${baseLocation}`;

const app = createServer();
let server;

let client = agent(baseUrl);

describe("Bucket tests",function() {
  beforeEach(function (done) {
    server = app.listen(port, () => { 
      // console.log(`server is listening on http://127.0.0.1:${port}`);
      done();
    });
  });
  afterEach( function (done) {
    server.close();
    memoryStorage.reset();
    done();
  });

  it("should create a new bucket",function(done){
    const bucketIdentifier = 'loan-commitment-liability';
    client
      .post('/')
      .send({identifier : bucketIdentifier})
      .expect("Content-type",/json/)
      .expect('Location', `${baseLocation}/${bucketIdentifier}`)
      .expect(201)
      .end(done);
  });

  it("should not allow to create a bucket with existing id", async function(){
    const bucketIdentifier = 'loan-commitment-liability';
    await client
      .post('/')
      .send({identifier : bucketIdentifier})
      .expect(201)
    
    await client
      .post('/')
      .send({identifier : bucketIdentifier})
      .expect(409)
  });



});



