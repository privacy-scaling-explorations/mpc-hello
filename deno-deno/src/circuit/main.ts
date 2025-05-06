// This obviously doesn't need to be a separate file, but it's here to
// demonstrate that you can split up your summon code like this.
import isEqual from './isEqual.ts';
import isLarger from './isLarger.ts';

export default (io: Summon.IO) => {
  const a = io.input('alice', 'a', summon.number());
  const b = io.input('bob', 'b', summon.number());

  let result;

  if (isEqual(a, b)) {
    result = 0;
  } else if (isLarger(a, b)) {
    result = 1;
  } else {
    result = 2;
  }

  io.outputPublic('main', result);
};
