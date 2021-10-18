import { Router } from 'express';
import { createResponse } from '../utility.js';
import memoryStorage from '../memory_storage.js';

const router = Router();

function validateDateFormat( dateStr ) {
  return dateStr.match(/\d\d\d\d-\d\d-\d\d/);
}

function validateInputParameterSchema( data ) {
  const invalidParameters = [];
  if( !data.loanId || typeof(data.loanId) !== 'string' ) {
    invalidParameters.push( { param: 'loanId', msg: "Parameter 'loanId' must be present and must be instance of type String."} )
  }
  if( !data.createdAt || typeof(data.createdAt) !== 'string' || !validateDateFormat(data.createdAt) ) {
    invalidParameters.push( { param: 'createdAt', msg: "Parameter 'effectiveDate' must be present and must be a string in a format YYYY-MM-DD" } )
  }
  if( !data.effectiveDate || typeof(data.effectiveDate) !== 'string' || !validateDateFormat(data.effectiveDate)  ) {
    invalidParameters.push( { param: 'effectiveDate', msg: "Parameter 'effectiveDate' must be present and must be a string in a format YYYY-MM-DD" } )
  }
  if( !data.value || ! (Number.isFinite(data.value)) || data.value <= 0 ) {
    invalidParameters.push( { param: 'value', msg: "Parameter 'value' must be present and must be a positive finite number." } )
  }
  if( !data.debitBucket || typeof(data.debitBucket) !== 'string' ) {
    invalidParameters.push( { param: 'debitBucket', msg: "Parameter 'debitBucket' must be present and must be instance of type String." } )
  }
  if( !data.creditBucket || typeof(data.creditBucket) !== 'string' ) {
    invalidParameters.push( { param: 'creditBucket', msg: "Parameter 'creditBucket' must be present and must be instance of type String." } )
  }
  return invalidParameters;
}

function validateInputParameterValues( data ) {
  const invalidParameters = [];
  if( !memoryStorage.hasBucket(data.debitBucket)  ) {
    invalidParameters.push( { param: 'debitBucket', msg: "Bucket not found." } )
  }
  if( !memoryStorage.hasBucket(data.creditBucket)  ) {
    invalidParameters.push( { param: 'creditBucket', msg: "Bucket not found." } )
  }
  return invalidParameters;
}

/**
* @api {post} /api/ledger/entries Add new entriy pair to the ledger
* @apiName Add new entriy pair to the ledger
*
* @apiBody  {String} [loanId] Mandatory Loan ID
* @apiBody  {String} [createdAt] Mandatory entry creation date in format YYYY-MM-DD
* @apiBody  {String} [effectiveDate] Mandatory entry effective date in format YYYY-MM-DD
* @apiBody  {Number} [value] Mandatory value
* @apiBody  {String} [debitBucket] Mandatory name of the debit bucket
* @apiBody  {String} [creditBucket] Mandatory name of the credit bucket
*
* @apiSuccess (201)  
*
* @apiError   (400)  InputParameterSchemaValidationError Input parameter failed schema validation
* @apiError   (409)  IncorrectInputParameters  One or more input parameters are invalid.
*/
router.post('/', (req, res) => {


  

  const inputParameterSchemaValidationErrors = validateInputParameterSchema(req.body);
  if( inputParameterSchemaValidationErrors.length > 0 ) {
    res
      .status(400)
      .send( createResponse('InputParameterSchemaValidationError', "Input parameter schema validation error", inputParameterSchemaValidationErrors) )
    return;
  }
  const inputParameterValueValidationErrors = validateInputParameterValues(req.body);
  if( inputParameterValueValidationErrors.length > 0 ) {
    res
      .status(409)
      .send( createResponse('IncorrectInputParameters', "One or more input parameters are invalid.", inputParameterValueValidationErrors) )
    return;    
  }


  const data = { 
    loanId: req.body.loanId,
    entries: [
      {
        createdAt: req.body.createdAt,
        effectiveDate: req.body.effectiveDate,
        value: req.body.value,
        bucket: req.body.debitBucket,
        },
      {
        createdAt: req.body.createdAt,
        effectiveDate: req.body.effectiveDate,
        value: -req.body.value,
        bucket: req.body.creditBucket,
      }
    ]
  };

  memoryStorage.addLedgerEntries( data.loanId, data.entries )


 
  res
  .status(201)
  .send( createResponse(false, "Added", data ) )


});


/**
* @api {get} /api/ledger/entries Get ledger entries for a given loan 
* @apiName Get ledger entries related to a load with the id equal to the given loanId
*
* @apiQuery  {String} [loanId] Mandatory loanId parameter
*
* @apiSuccess (200) {} 
* @apiError (404) LoanNotFound 
*/

router.get('/', (req, res) => {


  if( !memoryStorage.hasLedgerEntries( req.query.loanId ) ) {
    res
    .status(404)
    .send( createResponse('LoanNotFound', "Loan with given loanId was not found.") )
    return;   
  }


 
  res
  .status(200)
  .send( createResponse(false, "OK", { entries: memoryStorage.getLedgerEntries( req.query.loanId )  } ))


});


router.put('/', (req, res) => {
  res.send(405, 'Method Not Allowed');
});
router.delete('/', (req, res) => {
  res.send(405, 'Method Not Allowed');
});



export default router;