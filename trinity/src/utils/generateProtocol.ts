import * as summon from 'summon-ts';
import getCircuitFiles from './getCircuitFiles';
import { initTrinity, parseCircuit } from '@trinity-2pc/core';

export default async function generateProtocol() {
  await summon.init();
  const trinityModule = await initTrinity();

  const circuit = summon.compile({
    path: 'circuit/main.ts',
    boolifyWidth: 16,
    files: await getCircuitFiles(),
  });

  const circuit_parsed = parseCircuit(circuit.circuit.bristol, 16, 16, 16);

  return { trinityModule, circuit_parsed };
}
