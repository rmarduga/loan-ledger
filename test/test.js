// import { agent } from "supertest";
// // var should = require("should");

// // This agent refers to PORT where program is runninng.

// const server = agent("http://localhost:3000");

// // UNIT test begin

// describe("SAMPLE unit test",function(){

//   // #1 should return home page

//   // it("should return home page",function(done){
//   //    -------------------------------------
//   // });

//   it("should add two number",function(done){

//     //calling ADD api
//     server
//     .post('/add')
//     .send({num1 : 10, num2 : 20})
//     .expect("Content-type",/json/)
//     .expect(200)
//     .end(function(err,res){
//       res.status.should.equal(200);
//       res.body.error.should.equal(false);
//       res.body.data.should.equal(30);
//       done();
//     });
//   });

// });