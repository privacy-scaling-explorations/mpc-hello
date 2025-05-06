import * as summon from 'summon-ts';
import { readFileSync } from 'fs';
import { Protocol } from 'mpc-framework';
import { EmpWasmEngine } from 'emp-wasm-engine';

export default async function generateProtocol(mainFile: string) {
  await summon.init();

  const { circuit } = summon.compile({
    path: mainFile,
    boolifyWidth: 16,
    readFile: filePath => readFileSync(filePath, 'utf8'),
  });

  return new Protocol(circuit, new EmpWasmEngine());
}
