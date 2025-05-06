import * as summon from 'summon-ts';
import { Protocol } from 'mpc-framework';
import { EmpWasmEngine } from 'emp-wasm-engine';

export default async function generateProtocol(
  mainFile: string,
  filesOrReadFile:
    | { files: Record<string, string> }
    | { readFile: (path: string) => string },
) {
  await summon.init();

  const { circuit } = summon.compile({
    path: mainFile,
    boolifyWidth: 16,
    ...filesOrReadFile,
  });

  return new Protocol(circuit, new EmpWasmEngine());
}
