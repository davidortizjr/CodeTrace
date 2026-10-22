import type { Problem, Variant } from '../../problems/types.js';
import type { ErrorTypeId } from '../../engine/errors.js';

function v(id: string, type: ErrorTypeId, label: string, why: string, fix: string, ask: string[], code: string): Variant {
  return { id, type, label, why, fix, ask, code };
}

export const U4_EXERCISES: Problem[] = [
  {
    id: 'ex-js-destructuring-order',
    topic: 'js-modern',
    lesson: 'js-destructuring',
    title: 'Order total',
    difficulty: 1,
    prompt:
      'Write `orderTotal(order)` where `order` is an object like `{ price: 5, qty: 3, discount: 2 }`. Return `price * qty - discount`. The `qty` is optional and counts as 1 when it is missing, and `discount` is optional and counts as 0. Note that a `qty` of 0 is a real quantity: `{ price: 4, qty: 0 }` totals 0. Example: `orderTotal({ price: 5, qty: 3, discount: 2 })` returns 13.',
    concept: 'Destructure the parameter and use defaults, which apply only when a value is undefined.',
    fn: 'orderTotal',
    starter: `function orderTotal(order) {
  // unpack price, qty and discount (with defaults), then return the total
}
`,
    reference: `function orderTotal({ price, qty = 1, discount = 0 }) {
  return price * qty - discount;
}`,
    tests: [
      { args: [{ price: 5, qty: 3, discount: 2 }], cat: 'basic' },
      { args: [{ price: 5 }], cat: 'basic' },
      { args: [{ price: 10, qty: 2 }], cat: 'basic' },
      { args: [{ price: 12, discount: 4 }], cat: 'basic' },
      { args: [{ price: 4, qty: 0 }], cat: 'edge' },
      { args: [{ price: 9, qty: 2, discount: 0 }], cat: 'edge' },
    ],
    traceArgs: [{ price: 5, qty: 3, discount: 2 }],
    track: [],
    variants: [
      v(
        'no-default-qty',
        'bad-init',
        'No default for a missing qty',
        'When qty is not given it is undefined, and price * undefined is NaN, so the total is NaN.',
        'Give qty a default of 1 in the pattern.',
        ['What is `5 * undefined`?', 'Which test has no qty?'],
        `function orderTotal({ price, qty, discount = 0 }) {
  return price * qty - discount;
}`,
      ),
      v(
        'or-instead-of-default',
        'edge-case',
        'Treats a quantity of 0 as missing',
        'Using `qty || 1` replaces every falsy value, so a real quantity of 0 turns into 1.',
        'A default (`qty = 1`) only replaces undefined, so 0 stays 0.',
        ['What does `0 || 1` give?', 'What should the total be for a quantity of 0?'],
        `function orderTotal({ price, qty, discount = 0 }) {
  const count = qty || 1;
  return price * count - discount;
}`,
      ),
      v(
        'ignores-discount',
        'logic',
        'The discount is never subtracted',
        'The function returns price * qty and does not use the discount at all.',
        'Subtract the discount from the total.',
        ['Which test includes a discount?', 'What is missing from your return line?'],
        `function orderTotal({ price, qty = 1, discount = 0 }) {
  return price * qty;
}`,
      ),
      v(
        'discount-per-item',
        'logic',
        'The discount is applied to every item',
        'The discount is taken off each unit price before multiplying, so it is subtracted qty times instead of once.',
        'Multiply first, then subtract the discount once.',
        ['If you buy 3 items with a discount of 2, how much comes off in total?'],
        `function orderTotal({ price, qty = 1, discount = 0 }) {
  return (price - discount) * qty;
}`,
      ),
    ],
  },
  {
    id: 'ex-js-destructuring-merge',
    topic: 'js-modern',
    lesson: 'js-destructuring',
    title: 'Merge settings',
    difficulty: 2,
    prompt:
      'Write `mergeSettings(defaults, overrides)` that returns a new object with every setting from `defaults`, replaced by the values from `overrides` where both have the key. Keys that only appear in `overrides` are kept too. Values such as `false` and `0` in `overrides` are real choices and must win. Example: `mergeSettings({ theme: "light", sound: true }, { sound: false })` returns `{ theme: "light", sound: false }`.',
    concept: 'Spreading objects in order: the later spread wins.',
    fn: 'mergeSettings',
    starter: `function mergeSettings(defaults, overrides) {
  // return a new object that combines both
}
`,
    reference: `function mergeSettings(defaults, overrides) {
  return { ...defaults, ...overrides };
}`,
    tests: [
      { args: [{ theme: 'light', sound: true }, { sound: false }], cat: 'basic' },
      { args: [{ theme: 'light', size: 14 }, { theme: 'dark' }], cat: 'basic' },
      { args: [{ theme: 'light' }, { size: 20 }], cat: 'basic' },
      { args: [{ theme: 'light', size: 14 }, {}], cat: 'edge' },
      { args: [{}, { theme: 'dark' }], cat: 'edge' },
      { args: [{ size: 14, volume: 5 }, { volume: 0 }], cat: 'edge' },
    ],
    traceArgs: [{ theme: 'light', sound: true }, { sound: false }],
    track: [],
    variants: [
      v(
        'defaults-win',
        'logic',
        'The defaults replace the overrides',
        'The spreads are in the wrong order, so the later one (defaults) overwrites the learner chosen values.',
        'Spread defaults first and overrides last, because the later key wins.',
        ['When two spreads share a key, which one is kept?'],
        `function mergeSettings(defaults, overrides) {
  return { ...overrides, ...defaults };
}`,
      ),
      v(
        'only-defaults',
        'logic',
        'Overrides are ignored',
        'Only the defaults are copied, so no override ever takes effect.',
        'Spread the overrides into the new object as well.',
        ['Where do the values from `overrides` end up in your result?'],
        `function mergeSettings(defaults, overrides) {
  return { ...defaults };
}`,
      ),
      v(
        'falsy-lost',
        'edge-case',
        'Falsy overrides such as false and 0 are lost',
        'Picking each value with `||` falls back to the default whenever the override is false or 0, and it also drops keys that only exist in overrides.',
        'Spread the objects instead of choosing each key with `||`, so every provided value is kept as it is.',
        ['What does `false || true` give?', 'What happens to a key that is not in defaults?'],
        `function mergeSettings(defaults, overrides) {
  const result = {};
  for (const key of Object.keys(defaults)) {
    result[key] = overrides[key] || defaults[key];
  }
  return result;
}`,
      ),
      v(
        'only-overrides',
        'logic',
        'Defaults that are not overridden are lost',
        'The result is built from the overrides alone, so any setting that has no override disappears.',
        'Start from the defaults and then add the overrides on top.',
        ['What should happen to a setting that is only in defaults?'],
        `function mergeSettings(defaults, overrides) {
  return { ...overrides };
}`,
      ),
    ],
  },
  {
    id: 'ex-js-classes-rectangle',
    topic: 'js-modern',
    lesson: 'js-classes',
    title: 'Rectangle class',
    difficulty: 1,
    prompt:
      'Write a class `Rectangle` whose constructor takes `width` and `height`. Give it a getter `area` (width times height), a method `perimeter()` (twice the width plus twice the height) and a getter `isSquare` (true when width and height are equal). Then write `rectangleStats(width, height)`, which makes a `Rectangle` and returns `{ area, perimeter, isSquare }` using its getters and method. Example: `rectangleStats(3, 4)` returns `{ area: 12, perimeter: 14, isSquare: false }`.',
    concept: 'A class with a constructor, a getter and a method that read `this`.',
    fn: 'rectangleStats',
    starter: `class Rectangle {
  // add a constructor, the getters area and isSquare, and the method perimeter()
}

function rectangleStats(width, height) {
  // make a Rectangle and return { area, perimeter, isSquare }
}
`,
    reference: `class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  get area() {
    return this.width * this.height;
  }

  perimeter() {
    return 2 * this.width + 2 * this.height;
  }

  get isSquare() {
    return this.width === this.height;
  }
}

function rectangleStats(width, height) {
  const rectangle = new Rectangle(width, height);
  return {
    area: rectangle.area,
    perimeter: rectangle.perimeter(),
    isSquare: rectangle.isSquare,
  };
}`,
    tests: [
      { args: [3, 4], cat: 'basic' },
      { args: [5, 5], cat: 'basic' },
      { args: [10, 2], cat: 'basic' },
      { args: [1, 1], cat: 'edge' },
      { args: [0, 6], cat: 'edge' },
      { args: [7, 0], cat: 'edge' },
      { args: [250, 400], cat: 'large' },
    ],
    traceArgs: [3, 4],
    track: [],
    variants: [
      v(
        'area-added',
        'wrong-operator',
        'The area adds instead of multiplying',
        'The area is width + height, which is not the space the rectangle covers.',
        'Area is width times height.',
        ['What is the area of a 3 by 4 rectangle?', 'Which operator did you use in the getter?'],
        `class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  get area() {
    return this.width + this.height;
  }
  perimeter() {
    return 2 * this.width + 2 * this.height;
  }
  get isSquare() {
    return this.width === this.height;
  }
}
function rectangleStats(width, height) {
  const rectangle = new Rectangle(width, height);
  return { area: rectangle.area, perimeter: rectangle.perimeter(), isSquare: rectangle.isSquare };
}`,
      ),
      v(
        'perimeter-half',
        'logic',
        'The perimeter counts each side pair only once',
        'The perimeter is width + height, but a rectangle has two widths and two heights.',
        'Add up all four sides, or double the sum of width and height.',
        ['How many sides does a rectangle have?', 'What is the perimeter of a 3 by 4 rectangle?'],
        `class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  get area() {
    return this.width * this.height;
  }
  perimeter() {
    return this.width + this.height;
  }
  get isSquare() {
    return this.width === this.height;
  }
}
function rectangleStats(width, height) {
  const rectangle = new Rectangle(width, height);
  return { area: rectangle.area, perimeter: rectangle.perimeter(), isSquare: rectangle.isSquare };
}`,
      ),
      v(
        'missing-this',
        'runtime',
        'Reads width and height without this',
        'Inside a method, `width` is a plain variable that does not exist. The values live on `this`.',
        'Write `this.width` and `this.height` inside the getters and the method.',
        ['Where did the constructor store the width?', 'What does the error message say is not defined?'],
        `class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  get area() {
    return width * height;
  }
  perimeter() {
    return 2 * width + 2 * height;
  }
  get isSquare() {
    return width === height;
  }
}
function rectangleStats(width, height) {
  const rectangle = new Rectangle(width, height);
  return { area: rectangle.area, perimeter: rectangle.perimeter(), isSquare: rectangle.isSquare };
}`,
      ),
      v(
        'square-always',
        'logic',
        'isSquare is true for any rectangle with both sides set',
        'The getter returns whether both sides have a value, not whether they are equal.',
        'Compare the width and the height with each other.',
        ['What should isSquare be for 3 and 4?', 'What does your getter compare?'],
        `class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  get area() {
    return this.width * this.height;
  }
  perimeter() {
    return 2 * this.width + 2 * this.height;
  }
  get isSquare() {
    return this.width > 0 && this.height > 0;
  }
}
function rectangleStats(width, height) {
  const rectangle = new Rectangle(width, height);
  return { area: rectangle.area, perimeter: rectangle.perimeter(), isSquare: rectangle.isSquare };
}`,
      ),
    ],
  },
  {
    id: 'ex-js-classes-account',
    topic: 'js-modern',
    lesson: 'js-classes',
    title: 'Bank account',
    difficulty: 2,
    prompt:
      'Write a class `Account` with a private field `#balance`, a constructor that takes the starting balance, methods `deposit(amount)` and `withdraw(amount)`, and a getter `balance`. A deposit of 0 or less is ignored. A withdrawal that is 0 or less, or larger than the balance, is ignored too. Then write `accountBalance(start, actions)`, where `actions` is a list of `[kind, amount]` pairs such as `["deposit", 50]` or `["withdraw", 20]`. Make an `Account`, apply every action in order and return the final balance. Example: `accountBalance(100, [["deposit", 50], ["withdraw", 500], ["withdraw", 30]])` returns 120.',
    concept: 'A class that guards its own state with a private field and checks every change.',
    fn: 'accountBalance',
    starter: `class Account {
  // a private #balance, a constructor, deposit, withdraw and a balance getter
}

function accountBalance(start, actions) {
  // make an Account, apply each action in order, return the balance
}
`,
    reference: `class Account {
  #balance;

  constructor(start) {
    this.#balance = start;
  }

  deposit(amount) {
    if (amount > 0) {
      this.#balance += amount;
    }
  }

  withdraw(amount) {
    if (amount > 0 && amount <= this.#balance) {
      this.#balance -= amount;
    }
  }

  get balance() {
    return this.#balance;
  }
}

function accountBalance(start, actions) {
  const account = new Account(start);
  for (const [kind, amount] of actions) {
    if (kind === 'deposit') {
      account.deposit(amount);
    } else if (kind === 'withdraw') {
      account.withdraw(amount);
    }
  }
  return account.balance;
}`,
    tests: [
      { args: [100, [['deposit', 50], ['withdraw', 500], ['withdraw', 30]]], cat: 'basic' },
      { args: [0, [['deposit', 20], ['deposit', 5]]], cat: 'basic' },
      { args: [50, [['withdraw', 20], ['withdraw', 10]]], cat: 'basic' },
      { args: [10, []], cat: 'edge' },
      { args: [30, [['withdraw', 30]]], cat: 'edge' },
      { args: [30, [['withdraw', 31]]], cat: 'edge' },
      { args: [40, [['deposit', -10], ['withdraw', -5], ['deposit', 0]]], cat: 'edge' },
      { args: [5, [['deposit', 100], ['withdraw', 60], ['withdraw', 60], ['deposit', 1]]], cat: 'basic' },
    ],
    traceArgs: [100, [['deposit', 50], ['withdraw', 500], ['withdraw', 30]]],
    track: [],
    variants: [
      v(
        'overdraw',
        'edge-case',
        'Withdrawals can go past the balance',
        'The withdrawal is applied even when it is larger than the balance, so the balance goes negative.',
        'Check that the amount is not more than the balance before subtracting.',
        ['What should happen when you withdraw 500 from 150?', 'Which test makes the balance negative?'],
        `class Account {
  #balance;
  constructor(start) {
    this.#balance = start;
  }
  deposit(amount) {
    if (amount > 0) {
      this.#balance += amount;
    }
  }
  withdraw(amount) {
    if (amount > 0) {
      this.#balance -= amount;
    }
  }
  get balance() {
    return this.#balance;
  }
}
function accountBalance(start, actions) {
  const account = new Account(start);
  for (const [kind, amount] of actions) {
    if (kind === 'deposit') {
      account.deposit(amount);
    } else if (kind === 'withdraw') {
      account.withdraw(amount);
    }
  }
  return account.balance;
}`,
      ),
      v(
        'negative-deposit',
        'edge-case',
        'Negative deposits and withdrawals are accepted',
        'Nothing checks the sign of the amount, so a deposit of -10 lowers the balance and a withdrawal of -5 raises it.',
        'Ignore a deposit or withdrawal whose amount is 0 or less.',
        ['What does a deposit of -10 do to the balance in your code?'],
        `class Account {
  #balance;
  constructor(start) {
    this.#balance = start;
  }
  deposit(amount) {
    this.#balance += amount;
  }
  withdraw(amount) {
    if (amount <= this.#balance) {
      this.#balance -= amount;
    }
  }
  get balance() {
    return this.#balance;
  }
}
function accountBalance(start, actions) {
  const account = new Account(start);
  for (const [kind, amount] of actions) {
    if (kind === 'deposit') {
      account.deposit(amount);
    } else if (kind === 'withdraw') {
      account.withdraw(amount);
    }
  }
  return account.balance;
}`,
      ),
      v(
        'strict-limit',
        'boundary',
        'Withdrawing the whole balance is refused',
        'The check uses `<` instead of `<=`, so withdrawing exactly what is in the account does nothing.',
        'The amount may equal the balance. Which comparison allows that?',
        ['What should the balance be after withdrawing 30 from 30?', 'Is 30 less than 30?'],
        `class Account {
  #balance;
  constructor(start) {
    this.#balance = start;
  }
  deposit(amount) {
    if (amount > 0) {
      this.#balance += amount;
    }
  }
  withdraw(amount) {
    if (amount > 0 && amount < this.#balance) {
      this.#balance -= amount;
    }
  }
  get balance() {
    return this.#balance;
  }
}
function accountBalance(start, actions) {
  const account = new Account(start);
  for (const [kind, amount] of actions) {
    if (kind === 'deposit') {
      account.deposit(amount);
    } else if (kind === 'withdraw') {
      account.withdraw(amount);
    }
  }
  return account.balance;
}`,
      ),
      v(
        'stops-at-refusal',
        'control-flow',
        'Stops processing after a refused withdrawal',
        'The loop returns as soon as one withdrawal is refused, so the actions after it are never applied.',
        'A refused withdrawal should just be skipped. Keep going with the next action.',
        ['In the first example, what happens to the last withdrawal of 30?'],
        `class Account {
  #balance;
  constructor(start) {
    this.#balance = start;
  }
  deposit(amount) {
    if (amount > 0) {
      this.#balance += amount;
    }
  }
  withdraw(amount) {
    if (amount > 0 && amount <= this.#balance) {
      this.#balance -= amount;
      return true;
    }
    return false;
  }
  get balance() {
    return this.#balance;
  }
}
function accountBalance(start, actions) {
  const account = new Account(start);
  for (const [kind, amount] of actions) {
    if (kind === 'deposit') {
      account.deposit(amount);
    } else if (kind === 'withdraw') {
      if (!account.withdraw(amount)) {
        return account.balance;
      }
    }
  }
  return account.balance;
}`,
      ),
    ],
  },
];
