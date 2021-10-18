import { agent } from "supertest";
const port = 3000;
const baseLocation = '/api/ledger';
const baseUrl = `http://localhost:${port}${baseLocation}`;


let client = agent(baseUrl);
class Loan {

  constructor(loanId){
    this.id = '123';
    this.amount = 1100;
    this.interestRate = 0.08;
    this.dailyInterestRate =  this.interestRate / 365.0;
    this.bucketList = [
      'accounts-receivable-principal',
      'accounts-receivable-interest',
      'income-interest',
      'future-receivable-principal',
      'loan-commitment-liability',
      'cash',
    ]

  }
  async initBuckets() {
    for( let bucket of this.bucketList ) {
      await client.post('/buckets').send({identifier : bucket});
    }
  }
  async originate() {
    const payload = {
      loanId: this.id,
      createdAt: '2021-10-17',
      effectiveDate: '2021-10-17',
      value: this.amount,
      debitBucket: 'future-receivable-principal',
      creditBucket: 'loan-commitment-liability',
    };
    await client.post('/entries').send( payload );
  }
  async activate() {
    const payload = {
      loanId: this.id,
      createdAt: '2021-10-17',
      effectiveDate: '2021-10-17',
      value: this.amount,
      debitBucket: 'loan-commitment-liability',
      creditBucket: 'future-receivable-principal',
    };
    await client.post('/entries').send( payload );

    payload.debitBucket = 'accounts-receivable-principal';
    payload.creditBucket = 'cash';
    await client.post('/entries').send( payload );

  }
  async accrueDailyInterest(date) {
    const payload = {
      loanId: this.id,
      createdAt: date,
      effectiveDate: date,
      value: this.amount * this.dailyInterestRate,
      debitBucket: 'loan-commitment-liability',
      creditBucket: 'future-receivable-principal',
    };
    await client.post('/entries').send( payload );

  }
  async bucketsSum(){
    const getRes = await client.get(`/buckets?loanId=${this.id}&bucketids=${this.bucketList.join(',')}`);
    console.log(getRes.body);

  }

}

const loan = new Loan();
await loan.initBuckets();
await loan.originate();
await loan.activate();
const startDay = new Date();
for( let i = 0; i < 60; ++i ) {
  const today = new Date();
  today.setDate(startDay.getDate() + i);
  await loan.accrueDailyInterest( `${today.getFullYear()}-${("0" + (today.getMonth() + 1)).slice(-2)}-${("0" + today.getDate()).slice(-2)}` );
}
await loan.bucketsSum();


