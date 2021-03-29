// Importing object bases (CompBase, LayerBase, PropertyBase)
// TypeScript types (Layer, Comp, Value, Color etc)
// and global functions from 'expression-globals-typescript'
import { Comp, Layer, Property } from 'expression-globals-typescript';

// Creating a new composition object from CompBase
const thisComp = new Comp();
const thisLayer = new Layer();
const thisProperty = new Property<number>(0);

interface SpringProps {
  mass: number;
  stiffness: number;
  damping: number;
  initialVelocity: number;
}

function spring(
  { mass = 1, stiffness = 100, damping = 12, initialVelocity = 0 }: SpringProps,
  time = thisLayer.time
) {
  if (thisProperty.numKeys < 1) {
    throw new Error('Property must have keyframes to use eSpring');
  }
  if (time < thisProperty.key(2).time) {
    return thisProperty.key(1).value;
  }
  const w0: number = Math.sqrt(stiffness / mass);
  const zeta: number = damping / (2 * Math.sqrt(stiffness * mass));
  const a: number = 1;
  const isUnderDamped: boolean = zeta < 1;

  const wd: number = isUnderDamped ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  const b: number = isUnderDamped
    ? (zeta * w0 + -initialVelocity) / wd
    : -initialVelocity + w0;

  function getVal(progress: number) {
    if (isUnderDamped) {
      return (
        1 -
        Math.exp(-progress * zeta * w0) *
          (a * Math.cos(wd * progress) + b * Math.sin(wd * progress))
      );
    } else {
      return 1 - (a + b * progress) * Math.exp(-progress * w0);
    }
  }

  const currentKeyIndex = getLastKeyIndex();
  const prevKey = thisProperty.key(currentKeyIndex - 1);
  const currentKey = thisProperty.key(currentKeyIndex);

  return (
    prevKey.value +
    (currentKey.value - prevKey.value) * getVal(time - currentKey.time)
  );

  function getLastKeyIndex() {
    // Set curKey to the previous keyframe
    if (thisLayer.time < thisProperty.key(1).time) {
      return 1;
    }
    const curKey = thisProperty.nearestKey(time).index;
    if (thisProperty.key(curKey).time > time) {
      return curKey - 1;
    }

    return curKey;
  }
}

const version: string = '_npmVersion';

// Export values to appear in jsx files
export { version, spring };
