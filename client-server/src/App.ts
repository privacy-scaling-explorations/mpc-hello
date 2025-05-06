import AsyncQueue from './utils/AsyncQueue';
import assert from './utils/assert';
import { PORT } from './utils/constants';
import generateProtocol from './utils/generateProtocol';
import getCircuitFiles from './utils/getCircuitFiles';

export default class App {
  socket: WebSocket = new WebSocket(`ws://localhost:${PORT}`);
  msgQueue = new AsyncQueue<unknown>();

  constructor() {
    this.socket.addEventListener('error', console.error, { once: true });

    this.socket.addEventListener(
      'open',
      () => {
        this.socket.addEventListener('message', async (event: MessageEvent) => {
          const message = new Uint8Array(await event.data.arrayBuffer());

          // Using a message queue instead of passing messages directly to the MPC
          // protocol ensures that we don't miss anything sent before we begin.
          this.msgQueue.push(message);
        });
      },
      { once: true },
    );
  }

  async mpcLargest(
    value: number,
    onProgress?: (progress: number) => void,
  ): Promise<string> {
    const TOTAL_BYTES = 247331;
    let currentBytes = 0;

    const protocol = await generateProtocol('/circuit/main.ts', {
      files: await getCircuitFiles(),
    });

    const session = protocol.join('alice', { a: value }, (to, msg) => {
      assert(to === 'bob', 'Unexpected party');

      this.socket.send(msg);

      currentBytes += msg.byteLength;

      if (onProgress) {
        onProgress(currentBytes / TOTAL_BYTES);
      }
    });

    this.msgQueue.stream((msg: unknown) => {
      if (!(msg instanceof Uint8Array)) {
        throw new Error('Unexpected message type');
      }

      session.handleMessage('bob', msg);

      currentBytes += msg.byteLength;

      if (onProgress) {
        onProgress(currentBytes / TOTAL_BYTES);
      }
    });

    const output = await session.output();

    if (currentBytes !== TOTAL_BYTES) {
      console.error(
        [
          'Bytes sent & received was not equal to TOTAL_BYTES.',
          ' This causes incorrect progress calculations.',
          ` To fix, updated TOTAL_BYTES to ${currentBytes}.`,
        ].join(''),
      );
    }

    if (
      output === null ||
      typeof output !== 'object' ||
      typeof output.main !== 'number'
    ) {
      throw new Error('Unexpected output');
    }

    return output.main === 0
      ? 'equal'
      : output.main === 1
        ? 'larger'
        : 'smaller';
  }
}
