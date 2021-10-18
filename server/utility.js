 

export function createResponse( error, message, data ) {

  const response = { error: error, message: message, data: data };
  return response;
}


