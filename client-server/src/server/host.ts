import { readFileSync } from 'fs';
import inquirer from 'inquirer';
import { Session } from 'mpc-framework';
import { WebSocketServer } from 'ws';
import assert from '../utils/assert';
import { PORT } from '../utils/constants';
import generateProtocol from '../utils/generateProtocol';

// This script is the host server and it is supposed to impersonate Bob in the MPC.

// Create a WebSocket server that listens on the specified PORT.
const wss = new WebSocketServer({ port: PORT });

console.info(`Listening on port ${PORT}...\n`);

// Listen for incoming WebSocket connections.
wss.on('connection', async ws => {
  ws.on('error', console.error);

  // Generate the protocol with mpc-framework.
  const protocol = await generateProtocol('./src/circuit/main.ts', {
    readFile: filePath => readFileSync(filePath, 'utf8'),
  });

  // Set the session variable to manage the MPC between two
  // parties: Bob (this server) and Alice.
  let session: Session;

  // Handle incoming messages from Alice.
  ws.on('message', async (msg: Buffer) => {
    if (!session) {
      // Prompt the user for input to provide Bob's circuit input.
      const { number } = await inquirer.prompt({
        type: 'input',
        name: 'number',
        message: 'Enter your number:',
      });

      session = protocol.join('bob', { b: Number(number) }, (to, msg) => {
        assert(to === 'alice', 'Unexpected party');

        // Send the MPC message to Alice.
        ws.send(msg);
      });

      // Handle the MPC output to log the result.
      session.output().then(({ main }) => {
        console.log(
          `Your number is ${main === 0 ? 'equal' : main === 1 ? 'smaller' : 'larger'}`,
        );
      });
    }

    // Process incoming MPC messages for the session, assuming they are from Alice.
    session.handleMessage('alice', new Uint8Array(msg));
  });
});
