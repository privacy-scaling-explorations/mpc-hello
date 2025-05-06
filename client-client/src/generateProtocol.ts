import * as summon from 'summon-ts';
import { Protocol } from 'mpc-framework';
import { EmpWasmEngine } from 'emp-wasm-engine';
import getCircuitFiles from './getCircuitFiles';

export default async function generateProtocol() {
  await summon.init();

  const { circuit } = summon.compile({
    path: 'circuit/main.ts',
    boolifyWidth: 16,
    files: await getCircuitFiles(),
  });

  return new Protocol(circuit, new EmpWasmEngine());
}
