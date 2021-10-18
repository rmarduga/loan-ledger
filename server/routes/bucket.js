import { Router } from 'express';
import { createResponse } from '../utility.js';
import memoryStorage from '../memory_storage.js';
const router = Router();


router.post('/', (req, res) => {

  if( !req.body.identifier ) {
    res
    .status(400)
    .send( createResponse(true, "Missing 'identitfier' parameter."),  )
    return;
  }
  if( memoryStorage.hasBucket(req.body.identifier)) {
    res
    .status(409)
    .send( createResponse(true, "Bucket with such identifier already exists") )
    return;
  }
  const id = req.body.identifier;
  memoryStorage.addBucket( id );

  res
  .status(201)
  .setHeader('Location', `${req.baseUrl}/${id}`)
  .send( createResponse(false, "Created") )


});

function validateInputParameterSchema( data ) {
  const invalidParameters = [];
  if( !data.loanId || typeof(data.loanId) !== 'string' ) {
    invalidParameters.push( 
      { param: 'loanId',
        msg: "Parameter 'loanId' must be present and must be instance of type String."
      }
    );
  }
  if( !data.bucketids || typeof(data.bucketids) !== 'string' ) {
    invalidParameters.push( 
      { param: 'bucketids',
        msg: "Parameter 'bucketids' must be present and must be a comma separated string of bucket ids."
      }
    );
  }
  return invalidParameters;
}

function validateInputParameterValues( data ) {
  const invalidParameters = [];
  for( let bucketId of data.bucketids.split(',') ) {
    if( !memoryStorage.hasBucket(bucketId)  ) {
      invalidParameters.push( { param: 'bucketids', msg: "One or more bucket were not found." } )
    }
  }
  return invalidParameters;
}


/**
* @api {get} /api/buckets/entries Get sum of the ledger entries releted to a given loan 
* @apiName Get sum of the ledger entries releted to a loan with the id equal to the given loanId
*
* @apiQuery  {String} [loanId] Mandatory loanId parameter
* @apiQuery  {String} [bucketids] Mandatory comma separated list of bucket ids
*
* @apiSuccess (200) {} 
* @apiError   (400)  InputParameterSchemaValidationError Input parameter failed schema validation
* @apiError   (409)  IncorrectInputParameters  One or more input parameters are invalid.
*/
router.get('/', (req, res) => {


  const inputParameterSchemaValidationErrors = validateInputParameterSchema(req.query);
  if( inputParameterSchemaValidationErrors.length > 0 ) {
    res
      .status(400)
      .send( createResponse('InputParameterSchemaValidationError', "Input parameter schema validation error", inputParameterSchemaValidationErrors) )
    return;
  }
  const inputParameterValueValidationErrors = validateInputParameterValues(req.query);
  if( inputParameterValueValidationErrors.length > 0 ) {
    res
      .status(409)
      .send( createResponse('IncorrectInputParameters', "One or more input parameters are invalid.", inputParameterValueValidationErrors) )
    return;    
  }

  const data = {};
  for( let bucketId of req.query.bucketids.split(',') ) {
    data[bucketId] = memoryStorage.getLedgerEntries( req.query.loanId )
                      .filter( (e) => e.bucket === bucketId )
                      .map( e => e.value )
                      .reduce( (x,y) => x + y, 0 );
  }

  res
    .status(200)
    .send( data )


});


router.put('/', (req, res) => {
  res.send(405, 'Method Not Allowed');
});
router.delete('/', (req, res) => {
  res.send(405, 'Method Not Allowed');
});


export default router;