import type { Unit } from '../types.js';
import { JS_ASYNC, JS_MODULES } from './u4-lessons.js';
import { U4_BONUS, U4_EXAM } from './u4-exam.js';

export const JS_MODERN: Unit = {
  id: 'js-modern',
  track: 'js',
  title: 'Modern JavaScript',
  blurb: 'Destructuring, classes, modules and asynchronous code.',
  lessons: [
    {
      id: 'js-destructuring',
      title: 'Destructuring, rest and spread',
      summary: 'Unpack arrays and objects into variables, and gather or spread values with three dots.',
      minutes: 14,
      objectives: [
        'Unpack arrays and objects into separate variables',
        'Rename values and give them defaults while unpacking',
        'Destructure function parameters, including nested objects',
        'Use rest (`...`) to gather values and spread (`...`) to copy and combine them',
        'Swap two variables without a temporary one',
      ],
      sections: [
        {
          heading: 'Unpacking an array',
          body: [
            'Instead of reading a list item by item with `colors[0]`, `colors[1]` and so on, you can unpack it. Put square brackets on the left of the `=` and name the pieces in order. This is called **destructuring**.',
            'Leave a gap between commas to skip a value. If the list is shorter than your pattern, the extra names get `undefined`. A name can also have a default, which is used when the value is `undefined`.',
          ],
          examples: [
            {
              id: 'array-basic',
              lang: 'js',
              code: `const colors = ['red', 'green', 'blue'];
const [first, second] = colors;
console.log(first, second);

const [, , third] = colors;
console.log(third);`,
              output: ['red green', 'blue'],
              caption: 'Names are matched by position. Empty slots are skipped.',
            },
            {
              id: 'array-missing',
              lang: 'js',
              code: `const [x, y = 10, z] = [1];
console.log(x, y, z);`,
              output: ['1 10 undefined'],
              caption: 'Nothing was given for y, so the default fills in. Nothing for z, so it is undefined.',
            },
          ],
        },
        {
          heading: 'Unpacking an object',
          body: [
            'For objects, use curly braces and write the property names you want. The names must match the keys, and the order does not matter. Each name becomes a new variable.',
            'To use a different variable name, write `key: newName`. The part before the colon is the property to read, the part after it is the variable you get. Defaults work here too, with `= value`.',
          ],
          examples: [
            {
              id: 'object-basic',
              lang: 'js',
              code: `const user = { name: 'Ada', age: 36, city: 'London' };
const { name, age } = user;
console.log(name, age);

const { city: home } = user;
console.log(home);`,
              output: ['Ada 36', 'London'],
              caption: 'The second pattern reads `city` and calls the variable `home`.',
            },
            {
              id: 'object-defaults',
              lang: 'js',
              code: `const settings = { theme: 'dark' };
const { theme, fontSize = 14 } = settings;
console.log(theme, fontSize);

const { volume = 5, muted = false } = { volume: 0, muted: null };
console.log(volume, muted);`,
              output: ['dark 14', '0 null'],
              caption: 'A default only replaces `undefined`. A `0` or `null` is a real value and stays.',
            },
          ],
          notes: [
            { kind: 'watch-out', text: 'Defaults are used only when the value is `undefined`. If a property is `null`, `0` or an empty string, the default is ignored.' },
          ],
        },
        {
          heading: 'Nested values and function parameters',
          body: [
            'Patterns can be nested to reach inside an object within an object. Only the names at the end become variables: in the example below you get `name` and `city`, but not `customer` or `address`.',
            'You can also destructure right in the parameter list. The function then states which properties it needs, and the caller passes one object. A default of `= {}` after the pattern lets the function be called with no argument at all.',
          ],
          examples: [
            {
              id: 'nested',
              lang: 'js',
              code: `const order = {
  id: 7,
  customer: { name: 'Grace', address: { city: 'Boston' } },
};
const { customer: { name, address: { city } } } = order;
console.log(name, city);`,
              output: ['Grace Boston'],
            },
            {
              id: 'params',
              lang: 'js',
              code: `function greet({ name, age = 18 }) {
  return name + ' is ' + age;
}
console.log(greet({ name: 'Ada', age: 36 }));
console.log(greet({ name: 'Linus' }));

function welcome({ name = 'guest' } = {}) {
  return 'Hello, ' + name;
}
console.log(welcome());`,
              output: ['Ada is 36', 'Linus is 18', 'Hello, guest'],
            },
            {
              id: 'for-of-pairs',
              lang: 'js',
              code: `const prices = { tea: 3, coffee: 4 };
for (const [item, price] of Object.entries(prices)) {
  console.log(item, price);
}`,
              output: ['tea 3', 'coffee 4'],
              caption: 'Each entry is a two item array, so a loop can unpack it on the spot.',
            },
          ],
          notes: [
            { kind: 'watch-out', text: 'A destructured parameter with no default crashes when the function is called with nothing: `greet()` throws a TypeError, because there is no object to take `name` from.' },
          ],
        },
        {
          heading: 'Rest: gather what is left',
          body: [
            'Three dots on the left side of a pattern, or in a parameter list, collect the remaining values into a new array (or a new object). This is called **rest**. It must come last, because it takes whatever is left.',
            'In a function, `...prices` gathers every argument into a real array, so the function can take any number of values. In an object pattern, rest is a neat way to leave one property out.',
          ],
          examples: [
            {
              id: 'rest-array',
              lang: 'js',
              code: `const [winner, ...others] = ['Ada', 'Grace', 'Linus', 'Alan'];
console.log(winner);
console.log(others);`,
              output: ['Ada', "[ 'Grace', 'Linus', 'Alan' ]"],
            },
            {
              id: 'rest-object',
              lang: 'js',
              code: `const user = { id: 3, name: 'Ada', password: 'secret', city: 'London' };
const { password, ...safeUser } = user;
console.log(safeUser);`,
              output: ["{ id: 3, name: 'Ada', city: 'London' }"],
              caption: 'safeUser is a new object with everything except `password`.',
            },
            {
              id: 'rest-params',
              lang: 'js',
              code: `function total(...prices) {
  let sum = 0;
  for (const price of prices) {
    sum += price;
  }
  return sum;
}
console.log(total(2, 3, 5));
console.log(total());`,
              output: ['10', '0'],
            },
          ],
        },
        {
          heading: 'Spread: lay values out',
          body: [
            'The same three dots on the right side, or inside a call, do the opposite: they **spread** a list or an object out into separate items. Use it to pass an array as arguments, to copy an array, or to build a new one with extra items.',
            'Spreading an object copies its properties into a new object. When two spreads (or a spread and a plain property) share a key, the later one wins. This is the usual way to "change" an object without touching the original.',
          ],
          examples: [
            {
              id: 'spread-array',
              lang: 'js',
              code: `const scores = [72, 95, 88];
console.log(Math.max(...scores));

const withBonus = [0, ...scores, 100];
console.log(withBonus);

const copy = [...scores];
copy.push(1);
console.log(scores.length, copy.length);`,
              output: ['95', '[ 0, 72, 95, 88, 100 ]', '3 4'],
            },
            {
              id: 'spread-object',
              lang: 'js',
              code: `const base = { theme: 'light', size: 14 };
const custom = { ...base, size: 18 };
console.log(custom);
console.log(base);

const forced = { size: 18, ...base };
console.log(forced);`,
              output: ["{ theme: 'light', size: 18 }", "{ theme: 'light', size: 14 }", "{ size: 14, theme: 'light' }"],
              caption: 'The later entry wins. In `forced`, `base` comes last, so its size of 14 overrides 18.',
            },
          ],
          notes: [
            { kind: 'watch-out', text: 'Spread makes a shallow copy. Nested arrays and objects are still shared between the copy and the original, so changing one changes both.' },
          ],
        },
        {
          heading: 'Swapping two variables',
          body: [
            'A handy use of array destructuring is swapping. Build a new array of the two values in reverse order on the right, and unpack it into the same names on the left. No temporary variable is needed.',
            'The same trick swaps two positions in an array, which sorting code does a lot.',
          ],
          examples: [
            {
              id: 'swap',
              lang: 'js',
              code: `let current = 'left';
let other = 'right';
[current, other] = [other, current];
console.log(current, other);

const list = ['a', 'b', 'c'];
[list[0], list[2]] = [list[2], list[0]];
console.log(list);`,
              output: ['right left', "[ 'c', 'b', 'a' ]"],
            },
          ],
          notes: [
            { kind: 'watch-out', text: 'A line that starts with `[` can be glued to the line above it if that line has no semicolon. End the line before a swap with `;`.' },
          ],
        },
      ],
      recap: [
        'Array patterns match by position, object patterns match by key name.',
        'Write `key: newName` to rename, and `= value` for a default that applies only to `undefined`.',
        'You can destructure nested objects and function parameters. Give the parameter `= {}` if it may be missing.',
        'Rest (`...name`) gathers the remaining values into an array or object, and must come last.',
        'Spread (`...value`) lays out a list or object in a call, an array or an object. The later key wins, and the copy is shallow.',
        '`[a, b] = [b, a]` swaps two variables.',
      ],
      checks: [
        {
          id: 'js-destructuring.c1',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: { lang: 'js', text: `const [x, y = 10, z = 20] = [1, undefined, null];\nconsole.log(x, y, z);` },
          options: ['1 10 20', '1 10 null', '1 undefined null', '1 null null'],
          answer: 1,
          explanation: 'The middle value is `undefined`, so its default 10 is used. The last value is `null`, which is a real value, so the default 20 is ignored.',
          review: 'js-destructuring',
          verify: { kind: 'output' },
        },
        {
          id: 'js-destructuring.c2',
          kind: 'short',
          prompt: 'Type exactly what this prints.',
          code: { lang: 'js', text: `const base = { a: 1, b: 2 };\nconst next = { ...base, b: 5, c: 6 };\nconsole.log(next.b, next.c);` },
          accept: ['5 6'],
          explanation: 'The spread copies a and b. Then `b: 5` comes later and replaces the copied value, and `c: 6` is added.',
          review: 'js-destructuring',
          verify: { kind: 'output' },
        },
        {
          id: 'js-destructuring.c3',
          kind: 'mcq',
          prompt: 'What does `const { name: title } = book;` create?',
          options: [
            'A variable `name` holding `book.title`',
            'Two variables, `name` and `title`',
            'A variable `title` holding `book.name`',
            'A syntax error',
          ],
          answer: 2,
          explanation: 'The part before the colon is the property to read (`name`). The part after it is the new variable (`title`).',
          review: 'js-destructuring',
        },
      ],
      exercises: ['ex-js-destructuring-order', 'ex-js-destructuring-merge'],
    },
    {
      id: 'js-classes',
      title: 'Classes',
      summary: 'Build objects from a blueprint, with fields, methods, getters, inheritance and private state.',
      minutes: 16,
      objectives: [
        'Write a class with a constructor, fields and methods, and create objects with `new`',
        'Explain what `this` points to inside a method',
        'Use getters, setters and `static` members',
        'Extend a class with `extends` and `super`, and test with `instanceof`',
        'Keep data private with `#fields`, and know why a detached method loses `this`',
      ],
      sections: [
        {
          heading: 'A class is a blueprint',
          body: [
            'When you need many objects with the same shape and the same behaviour, such as many dogs, users or carts, write a **class** once and make objects from it with `new`. Each object is called an **instance**.',
            'The `constructor` runs every time you write `new`, and it sets the new object up. Inside it, `this` is the object being built. Methods are written in the class body without the word `function`. Inside a method, `this` is the object the method was called on: in `rex.speak()` it is `rex`.',
          ],
          examples: [
            {
              id: 'dog',
              lang: 'js',
              code: `class Dog {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return this.name + ' says woof';
  }
}

const rex = new Dog('Rex');
const fido = new Dog('Fido');
console.log(rex.speak());
console.log(fido.speak());
console.log(rex);`,
              output: ['Rex says woof', 'Fido says woof', "Dog { name: 'Rex' }"],
              caption: 'One class, two separate objects. Each one has its own `name`.',
            },
          ],
        },
        {
          heading: 'Fields and state',
          body: [
            'A **field** is a property declared in the class body, like `count = 0;`. Every new instance gets its own copy, so two counters never share a number and two carts never share an `items` array.',
            'Methods change the object by writing to `this`. Fields and methods are always reached through `this.`, even from inside another method of the same class.',
          ],
          examples: [
            {
              id: 'cart',
              lang: 'js',
              code: `class Cart {
  items = [];

  constructor(owner) {
    this.owner = owner;
  }

  add(name, price) {
    this.items.push({ name, price });
  }

  total() {
    let sum = 0;
    for (const item of this.items) {
      sum += item.price;
    }
    return sum;
  }
}

const cart = new Cart('Ada');
cart.add('tea', 3);
cart.add('cake', 5);
console.log(cart.total());
console.log(cart.items.length);`,
              output: ['8', '2'],
            },
            {
              id: 'forgot-this',
              lang: 'js',
              code: `class Counter {
  count = 0;

  add() {
    count += 1;
  }
}

new Counter().add();`,
              runtimeError: 'ReferenceError: count is not defined',
              caption: 'Without `this.`, JavaScript looks for an ordinary variable called `count` and finds none.',
            },
          ],
          notes: [
            { kind: 'watch-out', text: 'Inside a method, write `this.count`, not `count`. A bare name is a variable, not a field of the object.' },
          ],
        },
        {
          heading: 'Getters, setters and static members',
          body: [
            'A **getter** (`get name() {}`) looks like a property when you read it, but runs a function. A **setter** (`set name(value) {}`) runs when you assign to it. They let you compute a value on demand, or check a value before it is stored. You use them without brackets: `temp.fahrenheit`, not `temp.fahrenheit()`.',
            'A `static` member belongs to the class itself, not to its instances. You reach it through the class name, such as `Id.next()`. Use it for things that are not about one particular object, like a counter of how many were made, or a helper that builds one.',
          ],
          examples: [
            {
              id: 'getter-setter',
              lang: 'js',
              code: `class Temperature {
  constructor(celsius) {
    this.celsius = celsius;
  }

  get fahrenheit() {
    return (this.celsius * 9) / 5 + 32;
  }

  set fahrenheit(value) {
    this.celsius = ((value - 32) * 5) / 9;
  }
}

const temp = new Temperature(100);
console.log(temp.fahrenheit);
temp.fahrenheit = 32;
console.log(temp.celsius);`,
              output: ['212', '0'],
            },
            {
              id: 'static',
              lang: 'js',
              code: `class Id {
  static count = 0;

  static next() {
    Id.count += 1;
    return 'id-' + Id.count;
  }
}

console.log(Id.next());
console.log(Id.next());
console.log(Id.count);

const spare = new Id();
console.log(typeof spare.next);`,
              output: ['id-1', 'id-2', '2', 'undefined'],
              caption: 'Instances do not get static members. Only the class has them.',
            },
          ],
        },
        {
          heading: 'Extending a class',
          body: [
            'A class can build on another with `extends`. The new class (the **subclass**) gets every field and method of the old one (the **parent**), and can add more or replace some. Inside a replaced method, `super.method()` calls the parent version.',
            'If the subclass has its own `constructor`, it must call `super(...)` first. That runs the parent constructor, which creates `this`. The check `value instanceof Cat` is true when `value` was made by `Cat` or by any class that extends `Cat`.',
          ],
          examples: [
            {
              id: 'extends',
              lang: 'js',
              code: `class Animal {
  constructor(name) {
    this.name = name;
  }

  describe() {
    return this.name + ' is an animal';
  }
}

class Cat extends Animal {
  constructor(name, indoor) {
    super(name);
    this.indoor = indoor;
  }

  describe() {
    return super.describe() + ' and a cat';
  }

  purr() {
    return this.name + ' purrs';
  }
}

const tom = new Cat('Tom', true);
console.log(tom.describe());
console.log(tom.purr());
console.log(tom instanceof Cat, tom instanceof Animal);
console.log(new Animal('Rex') instanceof Cat);`,
              output: ['Tom is an animal and a cat', 'Tom purrs', 'true true', 'false'],
              caption: 'A Cat is also an Animal, but an Animal is not necessarily a Cat.',
            },
            {
              id: 'super-first',
              lang: 'js',
              code: `class Base {}

class Child extends Base {
  constructor() {
    this.ready = true;
    super();
  }
}

new Child();`,
              runtimeError: 'ReferenceError: Must call super constructor',
            },
          ],
          notes: [
            { kind: 'watch-out', text: 'In a subclass constructor you cannot touch `this` until `super(...)` has run. Call it on the first line.' },
          ],
        },
        {
          heading: 'Private fields',
          body: [
            'By default every field can be read and changed from anywhere. Put a `#` in front of the name, as in `#balance`, and the field becomes **private**: only code written inside the class body can see it. Outside code can ask for the value only through a getter or a method that you provide.',
            'This protects your data. In the example, nothing outside can set the balance to a negative number, because the only way in is `deposit`, which checks the amount first. Private fields do not show up in `Object.keys`.',
          ],
          examples: [
            {
              id: 'private',
              lang: 'js',
              code: `class BankAccount {
  #balance = 0;

  deposit(amount) {
    if (amount > 0) {
      this.#balance += amount;
    }
  }

  get balance() {
    return this.#balance;
  }
}

const account = new BankAccount();
account.deposit(50);
account.deposit(-20);
console.log(account.balance);
console.log(Object.keys(account));`,
              output: ['50', '[]'],
            },
            {
              id: 'private-outside',
              lang: 'js',
              run: false,
              code: `console.log(account.#balance);
// SyntaxError: Private field '#balance' must be declared in an enclosing class`,
              caption: 'Reaching for a private field from outside is rejected before the program even starts.',
            },
          ],
        },
        {
          heading: 'What a class really is, and losing this',
          body: [
            'A class is still a function underneath. `typeof` a class gives `"function"`, and calling one without `new` is an error. Methods live in one shared place and every instance uses them, which is why `this` matters: the same function body runs for many objects.',
            'The value of `this` is decided by how the method is **called**, not where it is written. `rex.speak()` has `rex` before the dot, so `this` is `rex`. If you copy the method into a variable and call it with nothing before the dot, `this` is `undefined`. This happens when you hand a method to something else, such as a timer. Fix it with `.bind(object)`, which makes a new function with `this` fixed, or by writing the method as an arrow function field, which keeps the `this` of the object being built.',
          ],
          examples: [
            {
              id: 'function-underneath',
              lang: 'js',
              code: `class Dog {
  bark() {
    return 'woof';
  }
}

console.log(typeof Dog);
console.log(new Dog().bark === new Dog().bark);
Dog();`,
              output: ['function', 'true'],
              runtimeError: "TypeError: Class constructor Dog cannot be invoked without 'new'",
            },
            {
              id: 'lost-this',
              lang: 'js',
              code: `class Greeter {
  constructor(name) {
    this.name = name;
  }

  hello() {
    return 'Hello, ' + this.name;
  }
}

const greeter = new Greeter('Ada');
const detached = greeter.hello;
try {
  detached();
} catch (error) {
  console.log(error.name + ': ' + error.message);
}

const bound = greeter.hello.bind(greeter);
console.log(bound());`,
              output: ["TypeError: Cannot read properties of undefined (reading 'name')", 'Hello, Ada'],
            },
            {
              id: 'arrow-field',
              lang: 'js',
              code: `class Button {
  constructor(label) {
    this.label = label;
  }

  click = () => 'Clicked ' + this.label;
}

const click = new Button('Save').click;
console.log(click());`,
              output: ['Clicked Save'],
              caption: 'An arrow function field remembers its object, so it still works when detached.',
            },
          ],
          notes: [
            { kind: 'watch-out', text: 'Passing `object.method` as a callback, as in `setTimeout(object.method, 100)`, detaches it. Pass `() => object.method()` or `object.method.bind(object)` instead.' },
          ],
        },
      ],
      recap: [
        'A class is a blueprint. `new` runs the `constructor` and gives back an instance.',
        'Inside a method, `this` is the object the method was called on. Reach fields and other methods with `this.`.',
        'Getters and setters look like properties. `static` members belong to the class, not to its instances.',
        '`extends` inherits, `super(...)` must run first in a subclass constructor, and `instanceof` checks the family.',
        'A `#field` is private to the class body, so outside code must go through your methods.',
        'A class is a function, and a method called without an object in front of it loses `this`.',
      ],
      checks: [
        {
          id: 'js-classes.c1',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: {
            lang: 'js',
            text: `class Counter {
  count = 0;
  add() {
    this.count += 1;
  }
}
const a = new Counter();
const b = new Counter();
a.add();
a.add();
b.add();
console.log(a.count, b.count);`,
          },
          options: ['3 3', '1 1', '2 1', '2 2'],
          answer: 2,
          explanation: 'Each instance has its own `count`. `a` was added to twice and `b` once, so they hold 2 and 1.',
          review: 'js-classes',
          verify: { kind: 'output' },
        },
        {
          id: 'js-classes.c2',
          kind: 'short',
          prompt: 'This code crashes. What is the name of the error?',
          code: {
            lang: 'js',
            text: `class Mug {
  constructor() {
    this.size = 'big';
  }
  describe() {
    return this.size;
  }
}
const mug = new Mug();
const describe = mug.describe;
console.log(describe());`,
          },
          accept: ['TypeError'],
          explanation: 'Calling `describe()` with nothing before the dot leaves `this` as `undefined`, and reading `size` from `undefined` is a TypeError.',
          review: 'js-classes',
          verify: { kind: 'throws', message: 'TypeError' },
        },
        {
          id: 'js-classes.c3',
          kind: 'mcq',
          prompt: 'What does this print?',
          code: { lang: 'js', text: `class Point {}\nconsole.log(typeof Point);` },
          options: ['object', 'function', 'class', 'undefined'],
          answer: 1,
          explanation: 'A class is a function underneath, so `typeof` reports "function". There is no separate "class" type.',
          review: 'js-classes',
          verify: { kind: 'output' },
        },
      ],
      exercises: ['ex-js-classes-rectangle', 'ex-js-classes-account'],
    },
    // @@NEXT-LESSON
    JS_MODULES,
    JS_ASYNC,
  ],
  exam: U4_EXAM,
  bonus: U4_BONUS,
};
