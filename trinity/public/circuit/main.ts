export default function main(io: Summon.IO) {
  const a = io.input('alice', 'a', summon.number());
  const b = io.input('bob', 'b', summon.number());

  io.outputPublic('main', a + b);
}
