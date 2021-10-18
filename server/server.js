import express from 'express';
import routes from './routes/index.js';
import morgan  from 'morgan';

import { createResponse } from './utility.js';


import { Router } from 'express';


export function createServer() {
  const app = express();
  const ledgerApiRouter = Router();
  app.use(express.json());
  app.use(express.urlencoded({
    extended: true
  }));
  app.use(morgan('combined'));

  ledgerApiRouter.use('/buckets', routes.bucket);
  ledgerApiRouter.use('/entries', routes.entries);

  app.use("/api/ledger", ledgerApiRouter);

  app.use((req, res) => {
    res
      .status(404)
      .send(  createResponse(true, "Resource not found") )
    ;
  });

  return app;

}