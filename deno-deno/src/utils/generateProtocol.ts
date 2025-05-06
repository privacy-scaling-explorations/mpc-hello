import * as summon from "summon-ts";
import { Protocol } from "mpc-framework";
import { EmpWasmEngine } from "emp-wasm-engine";

export default async function generateProtocol(mainFile: string) {
  await summon.init();

  const { circuit } = summon.compile({
    path: mainFile,
    boolifyWidth: 16,
    readFile: (filePath: string) => Deno.readTextFileSync(filePath),
  });

  return new Protocol(circuit, new EmpWasmEngine());
}
