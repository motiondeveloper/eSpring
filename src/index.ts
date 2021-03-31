// Importing object bases (CompBase, LayerBase, PropertyBase)
// TypeScript types (Layer, Comp, Value, Color etc)
// and global functions from 'expression-globals-typescript'
import { Comp, Layer, Property, Vector } from 'expression-globals-typescript';

// Creating a new composition object from CompBase
const thisComp = new Comp();
const thisLayer = new Layer();
const thisProperty = new Property<Vector>([0, 0, 0]);
// We define this here to keep typescript happy
// but its remove at compile time, and then created
// on the global object, so it's shared across layers
let __springCache = new WeakMap();

interface SpringConfig {
  mass: number;
  stiffness: number;
  damping: number;
  initialVelocity: number;
}

interface LibraryProps extends SpringConfig {
  property: Property<Vector>;
}

function spring(options: LibraryProps, time = thisLayer.time) {
  if (typeof __springCache === 'undefined') {
    __springCache = new WeakMap();
  }
  // Setting the default options
  const {
    mass = 1,
    stiffness = 100,
    damping = 12,
    initialVelocity = 0,
    property = thisProperty,
    ...invalidProps
  } = options;

  // If incorrect properties are passed in as options,
  // we let the user know
  const invalidPropNames = Object.getOwnPropertyNames(invalidProps);
  if (invalidPropNames.length !== 0) {
    throw Error(springError(`Invalid option:${list(invalidPropNames)}`));
  }

  // If there's no keyframes on the property, we error
  if (property.numKeys < 1) {
    throw Error(
      springError(
        `eSpring only works on properties with keyframes, couldn't find any on ${property.name}`
      )
    );
  }

  // If we're before the second keyframe, no need to animate
  // so return they key value
  if (time < property.key(2).time) {
    return property.key(1).value;
  }

  // Spring calculations
  function getSpringedProgress(progress: number, spring: SpringConfig) {
    if (!__springCache.has(spring)) {
      const { damping, stiffness, mass, initialVelocity } = spring;
      const w0: number = Math.sqrt(stiffness / mass);
      const zeta: number = damping / (2 * Math.sqrt(stiffness * mass));
      const a: number = 1;

      // If the damping is too low, we want to calculate the animation differently
      // to avoid swinging forever
      const isUnderDamped: boolean = zeta < 1;

      const wd: number = isUnderDamped ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
      const b: number = isUnderDamped
        ? (zeta * w0 + -initialVelocity) / wd
        : -initialVelocity + w0;
      if (isUnderDamped) {
        __springCache.set(
          spring,
          1 -
            Math.exp(-progress * zeta * w0) *
              (a * Math.cos(wd * progress) + b * Math.sin(wd * progress))
        );
      } else {
        __springCache.set(
          spring,
          1 - (a + b * progress) * Math.exp(-progress * w0)
        );
      }
    }
    return __springCache.get(spring);
  }

  const currentKeyIndex = getMostRecentKeyIndex();
  const previousKey = property.key(currentKeyIndex - 1);
  const currentKey = property.key(currentKeyIndex);

  const valueDelta = thisLayer.sub(currentKey.value, previousKey.value);
  const progressedAmount = thisLayer.mul(
    valueDelta,
    getSpringedProgress(time - currentKey.time, {
      damping,
      stiffness,
      mass,
      initialVelocity,
    })
  );
  return thisLayer.add(previousKey.value, progressedAmount);

  function getMostRecentKeyIndex() {
    // Set curKey to the previous keyframe
    if (thisLayer.time < property.key(1).time) {
      return 1;
    }
    const curKey = property.nearestKey(time).index;
    if (property.key(curKey).time > time) {
      return curKey - 1;
    }

    return curKey;
  }

  function springError(...errors: string[]) {
    return `in function spring().\n\n${errors.join('\n')}`;
  }

  function list(list: string[]) {
    return list.map((item) => `\n- ${item}`);
  }
}

const version: string = '_npmVersion';

// Export values to appear in jsx files
export { version, spring };
