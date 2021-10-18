class MemoryStorage{
  constructor(){
    this._buckets = new Set();
    this._ledgerEntriesGroupedByLoanId = new Map();
  }

  addBucket(bucketId){
    this._buckets.add(bucketId);
  }
  hasBucket(bucketId){
    return this._buckets.has(bucketId);
  }
  deleteBucket(bucketId) {
    this._buckets.delete(bucketId);
  }
  addLedgerEntries(loanId, entries){
    if( !this._ledgerEntriesGroupedByLoanId.has(loanId) ) {
      this._ledgerEntriesGroupedByLoanId.set(loanId, []);
    }
    this._ledgerEntriesGroupedByLoanId.get(loanId).push(...entries);
  }
  getLedgerEntries(loanId){
    return this._ledgerEntriesGroupedByLoanId.get(loanId);
  }
  hasLedgerEntries(loanId){
    return this._ledgerEntriesGroupedByLoanId.has(loanId);
  }




  reset(){
    this._buckets = new Set();
    this._ledgerEntriesGroupedByLoanId = new Map();
  }

}

const instance = new MemoryStorage();

export default instance;
