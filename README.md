# ➰ eSpring

**Hold-frame based spring animations.**

Add hold keyframes to a property, call `spring()`, that's it!.

The duration for each animation is set by the spring configuration, so you only need to add one keyframe for each value.

> This project was created with [create-expression-lib](https://github.com/motiondeveloper/create-expression-lib)

## Setup

1. Download the latest version from the [releases](https://github.com/motiondeveloper/releases) page.
2. Import it into After Effects

## Expression

Usage:

```js
const { eSpring } = footage('eSpring.jsx').sourceData;
eSpring();
```

Types:

```ts
eSpring(options = {
    mass = 1,
    stiffness = 100,
    damping = 10,
    initialVelocity = 0,
    property = thisProperty,
    __fast = false,
  }, time = thisLayer.time): PropertyValueType
```

**Returns:** the bounced animation, starting at the keyframe time with the duration set from the spring configuration.

**Options:**

- `mass`, `stiffness`, `damping`, `initialVelocity`: The spring parameters used to control the animation
- `property`: The property to get the value from
- `__fast`: This bypasses part of the algorithm that ensures animating out of a in-progress animation is smooth. Setting it to false will give a small speed improvement with less accurate animation in certain scenarios.

---

🕹 You can use an [interactive demo here](https://webkit.org/demos/spring/) to play around with different spring configurations.

---

The library also exposes a version string you can use to check if it's up to date:

```js
throw footage('eSpring.jsx').sourceData.version;
```

## Development

1. **Clone project locally**

   ```sh
   git clone https://github.com/motiondeveloper/eSpring.git
   cd eSpring
   ```

2. **Start Rollup**

   Start Rollup in watch mode to automatically refresh your code as you make changes, by running:

   ```sh
   npm run watch
   ```

   _You can run also run a once off build:_ `npm run build`

3. **Edit the `src` files**

   _The `index.ts` contains an example expression setup._

   Any values exported from this file will be included in your library, for example:

   ```js
   export { someValue };
   ```

4. **Import the `dist` file into After Effects**

   Use the compiled output file as you would any other `.jsx` library. Any changes to the `src` files will be live updated, and After Effects will update the result of your expression.
