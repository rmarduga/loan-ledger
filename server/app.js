import { createServer } from './server.js';


const port = process.env.PORT || 3000;

const app = createServer();
const server = app.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`);
});


function shutDown() {
  server.close(() => {
      console.log('Server shoutdown');
      process.exit(0);
  });
}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);



