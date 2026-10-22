import type { Unit } from '../types.js';

export const TS_SHAPES: Unit = {
  id: 'ts-shapes',
  track: 'ts',
  title: 'Describing shapes',
  blurb: 'Objects, interfaces, unions and the built-in helper types.',
  lessons: [
    {
      id: 'ts-objects',
      title: 'Object types',
      summary: 'Describe objects with interfaces and type aliases, and see how TypeScript decides whether an object fits.',
      minutes: 14,
      objectives: [
        'Describe an object with a type, an interface or a type alias',
        'Mark properties optional with ? and unchangeable with readonly',
        'Explain structural typing and why excess property checks exist',
        'Describe a dictionary with an index signature',
        'Build bigger shapes with extends, intersections and nesting',
      ],
      sections: [
        {
          heading: 'Describing an object\'s shape',
          body: [
            'In JavaScript an object can hold anything under any name. In TypeScript you describe its **shape**: which properties it has and the type of each. You write the shape between braces, as `{ name: string; age: number }`.',
            'The compiler then checks every object you build against that shape. A missing property, a wrong type or a misspelt name is an error on the line where you wrote it, not a crash somewhere later.',
          ],
          examples: [
            {
              id: 'shape-basic',
              lang: 'ts',
              code: `const user: { name: string; age: number } = { name: 'Ada', age: 36 };
console.log(user.name, user.age + 1);`,
              output: ['Ada 37'],
            },
            {
              id: 'shape-missing',
              lang: 'ts',
              code: `const user: { name: string; age: number } = { name: 'Ada' };
console.log(user.name);`,
              output: ['Ada'],
              errors: [{ code: 2741, line: 1 }],
              caption: 'The shape asks for an age, and the object has none.',
            },
            {
              id: 'shape-typo',
              lang: 'ts',
              code: `const user = { name: 'Ada', age: 36 };
console.log(user.nmae);`,
              output: ['undefined'],
              errors: [{ code: 2339, line: 2 }],
              caption: 'JavaScript quietly prints undefined. TypeScript points at the misspelt name, because user has no nmae property.',
            },
          ],
        },
        {
          heading: 'Naming a shape: interface and type',
          body: [
            'Writing the shape out every time gets noisy. Give it a name with `interface` or with `type`, then use the name wherever a type goes.',
            'For objects the two are almost the same, so pick one and stay consistent. An `interface` can be extended and reopened later. A `type` alias can also name things that are not objects, such as the unions in the next lesson.',
          ],
          examples: [
            {
              id: 'interface-type',
              lang: 'ts',
              code: `interface Product {
  name: string;
  price: number;
}

type Customer = {
  name: string;
  email: string;
};

function label(product: Product): string {
  return product.name + ' costs ' + product.price;
}

const mug: Product = { name: 'Mug', price: 8 };
const buyer: Customer = { name: 'Grace', email: 'grace@example.com' };
console.log(label(mug));
console.log(buyer.email);`,
              output: ['Mug costs 8', 'grace@example.com'],
            },
          ],
          notes: [
            { kind: 'in-js', text: 'Plain JavaScript has no declared shape: you learn what is inside an object by running the code. A named type gives you that information up front, and it costs nothing at runtime.' },
          ],
        },
        {
          heading: 'Optional and read-only properties',
          body: [
            'Put `?` after a property name to make it optional: the object may leave it out. Reading it gives either its type or `undefined`, so handle both before you use it as the real type.',
            'Put `readonly` before a property to forbid changing it after the object is created. It suits things like an `id` that should never change.',
          ],
          examples: [
            {
              id: 'optional',
              lang: 'ts',
              code: `interface User {
  name: string;
  nickname?: string;
}

function greeting(user: User): string {
  return 'Hi, ' + (user.nickname ?? user.name);
}

console.log(greeting({ name: 'Margaret', nickname: 'Peggy' }));
console.log(greeting({ name: 'Ada' }));`,
              output: ['Hi, Peggy', 'Hi, Ada'],
            },
            {
              id: 'optional-misuse',
              lang: 'ts',
              code: `interface User {
  name: string;
  nickname?: string;
}

const user: User = { name: 'Ada' };
console.log(user.nickname.toUpperCase());`,
              runtimeError: 'TypeError',
              errors: [{ code: 18048, line: 7 }],
              caption: 'The compiler warns that nickname may be undefined. Without the warning this crashes at runtime.',
            },
            {
              id: 'readonly',
              lang: 'ts',
              code: `interface Ticket {
  readonly id: number;
  seat: string;
}

const ticket: Ticket = { id: 7, seat: '12A' };
ticket.seat = '14C';
ticket.id = 99;
console.log(ticket.id, ticket.seat);`,
              output: ['99 14C'],
              errors: [{ code: 2540, line: 8 }],
              caption: 'Changing seat is fine. Changing id is the error on line 8.',
            },
          ],
          notes: [
            { kind: 'watch-out', text: '`readonly` is only a promise to the compiler. Look at the last example: the program still ran and changed the id. Types are removed before the code runs.' },
          ],
        },
        {
          heading: 'Structural typing and excess properties',
          body: [
            'TypeScript does not care what an object was called or where it came from. If it has the properties a type asks for, with the right types, it fits. This is **structural typing**, often called duck typing: if it has the shape of a duck, it is a duck. Extra properties do no harm.',
            'There is one exception. When you write an object literal directly where a type is expected, TypeScript assumes an unknown property is a mistake. This is the **excess property check**, and it catches typos that would otherwise slip through, especially on optional properties.',
          ],
          examples: [
            {
              id: 'structural',
              lang: 'ts',
              code: `interface Point {
  x: number;
  y: number;
}

function show(point: Point): string {
  return point.x + ',' + point.y;
}

const pixel = { x: 3, y: 4, color: 'red' };
console.log(show(pixel));`,
              output: ['3,4'],
              caption: 'pixel has a color that Point never mentions. It is not a fresh literal at the call, so it fits.',
            },
            {
              id: 'excess',
              lang: 'ts',
              code: `interface User {
  name: string;
  nickname?: string;
}

const user: User = { name: 'Ada', nickName: 'Lovelace' };
console.log(user.nickname);`,
              output: ['undefined'],
              errors: [{ code: 2561, line: 6 }],
              caption: 'Without the excess property check this typo would compile, because nickname is optional anyway.',
            },
          ],
          notes: [
            { kind: 'tip', text: 'The check only applies to a literal written in place. Put the same object in a variable first and it is skipped, as in the first example.' },
          ],
        },
        {
          heading: 'Index signatures',
          body: [
            'Sometimes you do not know the property names in advance, such as scores keyed by player name. An index signature describes that: `{ [item: string]: number }` means any string key holds a number.',
            'You can add and read any key. TypeScript trusts the signature, so it believes every key you read is there.',
          ],
          examples: [
            {
              id: 'index',
              lang: 'ts',
              code: `const stock: { [item: string]: number } = { apples: 4, pears: 0 };
stock.kiwis = 12;
console.log(stock.kiwis, stock.plums);`,
              output: ['12 undefined'],
              caption: 'TypeScript thinks stock.plums is a number. At runtime it is undefined.',
            },
          ],
          notes: [
            { kind: 'watch-out', text: 'A key that was never added reads as `undefined` even though the type says `number`. Use `??` or `in` when a key might be missing.' },
          ],
        },
        {
          heading: 'Extending and nesting',
          body: [
            'A property can itself be an object type, so shapes nest. An interface can build on another with `extends`: it has everything the first had plus its own properties.',
            'For `type` aliases, an intersection `A & B` does the same job: the value must satisfy both shapes at once.',
          ],
          examples: [
            {
              id: 'extend',
              lang: 'ts',
              code: `interface Address {
  city: string;
  country: string;
}

interface Person {
  name: string;
  address: Address;
}

interface Employee extends Person {
  employeeId: number;
}

type Manager = Employee & { reports: string[] };

const lead: Manager = {
  name: 'Grace',
  address: { city: 'Manila', country: 'Philippines' },
  employeeId: 101,
  reports: ['Ada', 'Alan'],
};
console.log(lead.name, lead.address.city, lead.reports.length);`,
              output: ['Grace Manila 2'],
            },
          ],
        },
      ],
      recap: [
        'A shape lists property names and types: `{ name: string; age: number }`. Name it with `interface` or `type`.',
        '`?` makes a property optional (its type includes `undefined`). `readonly` stops reassignment, but only in the compiler.',
        'Structural typing: any object with the right properties fits, whatever it was called.',
        'Excess property checks reject unknown properties in an object literal written in place, which catches typos.',
        'An index signature `[key: string]: number` describes a dictionary. `extends` and `&` combine shapes.',
      ],
      checks: [
        {
          id: 'ts-objects.c1',
          kind: 'mcq',
          prompt: 'Which line is the type error?',
          code: {
            lang: 'ts',
            text: `interface Book { title: string; pages?: number }
const a: Book = { title: 'Dune' };
const b: Book = { title: 'Emma', pages: 474 };
const c: Book = { pages: 300 };`,
          },
          options: ['Line 2', 'Line 3', 'Line 4', 'There is no error'],
          answer: 2,
          explanation: 'The pages property is optional, but title is required, and line 4 leaves it out.',
          review: 'ts-objects',
          verify: { kind: 'ts-error', line: 4, code: 2741 },
        },
        {
          id: 'ts-objects.c2',
          kind: 'short',
          prompt: 'What does this print?',
          code: {
            lang: 'ts',
            text: `const settings: { readonly volume: number; muted?: boolean } = { volume: 7 };
console.log(settings.muted ?? false);`,
          },
          accept: ['false'],
          explanation: 'muted was left out, so it reads as undefined and `??` falls back to false.',
          review: 'ts-objects',
          verify: { kind: 'output' },
        },
        {
          id: 'ts-objects.c3',
          kind: 'mcq',
          prompt: 'A function takes a `Point` (x and y). You pass a variable holding `{ x: 1, y: 2, color: "red" }` and there is no error. Why?',
          options: [
            'Extra properties are always allowed',
            'The variable is not a fresh literal, so only the shape is compared, and it has x and y',
            'TypeScript ignores the type of anything declared with const',
            'The color property is optional by default',
          ],
          answer: 1,
          explanation: 'Excess property checks apply only to object literals written in place. A variable is compared structurally, and a shape with extra properties still fits.',
          review: 'ts-objects',
        },
      ],
      exercises: ['ex-ts-objects-run', 'ex-ts-objects-types'],
    },
    {
      id: 'ts-unions',
      title: 'Unions of shapes',
      summary: 'Model values that come in several forms with discriminated unions, and let the compiler check you handled every one.',
      minutes: 14,
      objectives: [
        'Use a union of object types for data that has several forms',
        'Add a literal tag to make a discriminated union',
        'Narrow a union by checking its tag with if or switch',
        'Use never to make the compiler flag an unhandled case',
        'Model loading, success and error as a union instead of loose flags',
      ],
      sections: [
        {
          heading: 'One of several shapes',
          body: [
            'A union type `A | B` says a value is one of several types. You met unions of primitives in ts-basics. They work for object types too, which is how you model data that comes in different forms: a circle or a rectangle, a payment by card or by cash.',
            'The catch: you can only touch what every member has. To use a property that only some members have, you first have to find out which one you are holding.',
          ],
          examples: [
            {
              id: 'union-problem',
              lang: 'ts',
              code: `type Circle = { radius: number };
type Rectangle = { width: number; height: number };
type Shape = Circle | Rectangle;

function area(shape: Shape): number {
  return shape.radius ** 2 * 3;
}
console.log(area({ width: 2, height: 3 }));`,
              output: ['NaN'],
              errors: [{ code: 2339, line: 6 }],
              caption: 'A rectangle has no radius, so the arithmetic quietly gives NaN. The compiler catches it first.',
            },
          ],
        },
        {
          heading: 'A tag that tells them apart',
          body: [
            'Give every member a property with the same name but a different literal value, conventionally `kind`, `type` or `status`. That is a **discriminated union**, and the shared property is the **tag**.',
            'The tag is always readable, because every member has it. Check it, and TypeScript knows which member you hold. After an `if` that returns, it also knows the member left over.',
          ],
          examples: [
            {
              id: 'tagged',
              lang: 'ts',
              code: `type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number };

function describe(shape: Shape): string {
  if (shape.kind === 'circle') {
    return 'circle with radius ' + shape.radius;
  }
  return 'rectangle ' + shape.width + ' by ' + shape.height;
}
console.log(describe({ kind: 'circle', radius: 2 }));
console.log(describe({ kind: 'rectangle', width: 3, height: 4 }));`,
              output: ['circle with radius 2', 'rectangle 3 by 4'],
              caption: 'Inside the if, shape is a circle. After it, only the rectangle is left.',
            },
          ],
          notes: [
            { kind: 'watch-out', text: 'The tag must have a literal type such as `\'circle\'`. If you write `kind: string`, nothing can be narrowed.' },
          ],
        },
        {
          heading: 'Narrowing by the tag',
          body: [
            'A `switch` on the tag reads well when there are several cases, and each `case` narrows the value for its body. The compiler also catches a tag that can never match, such as a typo.',
            'Narrowing works only inside the branch. Ask for a property that belongs to another member and you get the same error as before.',
          ],
          examples: [
            {
              id: 'switch',
              lang: 'ts',
              code: `type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.round(Math.PI * shape.radius ** 2);
    case 'rectangle':
      return shape.width * shape.height;
  }
}
console.log(area({ kind: 'circle', radius: 2 }));
console.log(area({ kind: 'rectangle', width: 3, height: 4 }));`,
              output: ['13', '12'],
            },
            {
              id: 'wrong-branch',
              lang: 'ts',
              code: `type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number };

function area(shape: Shape): number {
  if (shape.kind === 'circle') {
    return shape.width;
  }
  if (shape.kind === 'triangle') {
    return 0;
  }
  return shape.width * shape.height;
}`,
              errors: [
                { code: 2339, line: 7 },
                { code: 2367, line: 9 },
              ],
              caption: 'Line 7 asks a circle for a width. Line 9 compares to a tag that no member has.',
            },
          ],
        },
        {
          heading: 'Checking every case with never',
          body: [
            'The type `never` has no values at all. If you have handled every member of a union, what is left in the `default` branch is `never`. Assign it to a variable of type `never` and the compiler will accept that only while nothing is left over.',
            'Add a new member to the union later and forget its case: the leftover is no longer `never`, and the assignment becomes an error that points at the function you need to update.',
          ],
          examples: [
            {
              id: 'exhaustive',
              lang: 'ts',
              code: `type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'triangle'; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.round(Math.PI * shape.radius ** 2);
    case 'square':
      return shape.side ** 2;
    case 'triangle':
      return (shape.base * shape.height) / 2;
    default: {
      const unhandled: never = shape;
      return unhandled;
    }
  }
}
console.log(area({ kind: 'triangle', base: 4, height: 5 }));`,
              output: ['10'],
            },
            {
              id: 'forgot-case',
              lang: 'ts',
              code: `type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'triangle'; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.round(Math.PI * shape.radius ** 2);
    case 'square':
      return shape.side ** 2;
    default: {
      const unhandled: never = shape;
      return unhandled;
    }
  }
}
console.log(area({ kind: 'square', side: 3 }));`,
              output: ['9'],
              errors: [{ code: 2322, line: 13 }],
              caption: 'The triangle case is missing, so a triangle is left over and is not never.',
            },
          ],
        },
        {
          heading: 'Modelling loading, success and error',
          body: [
            'A common job for a union is the state of a request. The tempting version is one object with optional pieces, but then nothing stops nonsense such as a request that is loading and has failed at once.',
            'Make each state its own member instead. Data exists only in the success state and a message only in the error state, so the impossible combinations cannot be written.',
          ],
          examples: [
            {
              id: 'loose-state',
              lang: 'ts',
              code: `type LooseState = { loading: boolean; data?: string[]; error?: string };
const nonsense: LooseState = { loading: true, data: ['a'], error: 'boom' };
console.log(nonsense.loading, nonsense.error);`,
              output: ['true boom'],
              caption: 'This compiles. A request that is loading, finished and failed at once is allowed.',
            },
            {
              id: 'state-union',
              lang: 'ts',
              code: `type FetchState =
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'error'; message: string };

function render(state: FetchState): string {
  switch (state.status) {
    case 'loading':
      return 'Loading...';
    case 'success':
      return state.data.length + ' items';
    case 'error':
      return 'Failed: ' + state.message;
  }
}
console.log(render({ status: 'loading' }));
console.log(render({ status: 'success', data: ['a', 'b'] }));
console.log(render({ status: 'error', message: 'timeout' }));`,
              output: ['Loading...', '2 items', 'Failed: timeout'],
            },
            {
              id: 'state-impossible',
              lang: 'ts',
              code: `type FetchState =
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'error'; message: string };

const broken: FetchState = { status: 'loading', message: 'boom' };
console.log(broken.status);`,
              output: ['loading'],
              errors: [{ code: 2353, line: 6 }],
              caption: 'A loading state with an error message cannot be written down.',
            },
          ],
        },
      ],
      recap: [
        'A union of object types models data that comes in several forms. You can only use what every member has.',
        'A discriminated union gives each member a literal tag (`kind`, `type` or `status`).',
        'Checking the tag with `if` or `switch` narrows the value to one member inside that branch.',
        'Assigning the leftover value to `never` in `default` makes a forgotten case a compile error.',
        'Model request states as separate members so impossible combinations cannot be written.',
      ],
      checks: [
        {
          id: 'ts-unions.c1',
          kind: 'mcq',
          prompt: 'Which line is the type error?',
          code: {
            lang: 'ts',
            text: `type Pet = { kind: 'dog'; barks: boolean } | { kind: 'fish'; fins: number };
function describe(pet: Pet): string {
  if (pet.kind === 'dog') {
    return pet.fins > 0 ? 'has fins' : 'barks';
  }
  return pet.fins + ' fins';
}`,
          },
          options: ['Line 2', 'Line 4', 'Line 6', 'There is no error'],
          answer: 1,
          explanation: 'Inside the `dog` branch the pet is a dog, and a dog has no fins. Line 6 is fine because only the fish is left there.',
          review: 'ts-unions',
          verify: { kind: 'ts-error', line: 4, code: 2339 },
        },
        {
          id: 'ts-unions.c2',
          kind: 'short',
          prompt: 'What does this print?',
          code: {
            lang: 'ts',
            text: `type Result = { status: 'ok'; value: number } | { status: 'failed'; reason: string };
const results: Result[] = [
  { status: 'ok', value: 2 },
  { status: 'failed', reason: 'timeout' },
  { status: 'ok', value: 5 },
];
let total = 0;
for (const result of results) {
  if (result.status === 'ok') total += result.value;
}
console.log(total);`,
          },
          accept: ['7'],
          explanation: 'Only the two ok results add their value: 2 + 5. The failed one is skipped.',
          review: 'ts-unions',
          verify: { kind: 'output' },
        },
        {
          id: 'ts-unions.c3',
          kind: 'mcq',
          prompt: 'What does `const unhandled: never = shape;` in the `default` branch of a switch give you?',
          options: [
            'It throws an error at runtime when a case is missing',
            'It makes the switch run faster',
            'A compile error when a union member has no case',
            'It converts the leftover value to a string',
          ],
          answer: 2,
          explanation: 'If every member is handled, nothing is left and the assignment compiles. A member without a case is left over, so it cannot be assigned to never and the compiler reports it.',
          review: 'ts-unions',
        },
      ],
      exercises: ['ex-ts-unions-run', 'ex-ts-unions-types'],
    },
    {
      id: 'ts-classes',
      title: 'Classes with types',
      summary: 'Type fields and constructors, control access with modifiers, and use interfaces and abstract classes.',
      minutes: 15,
      objectives: [
        'Type the fields, constructor and methods of a class',
        'Use parameter properties as a shorthand for fields',
        'Choose between public, private, protected and readonly',
        'Use implements and abstract classes to promise a shape',
        'Explain the difference between private and #private',
      ],
      sections: [
        {
          heading: 'Fields, constructors and parameter properties',
          body: [
            'A class declares its fields with types at the top of the body. The constructor and each method take typed parameters, like any function. In strict mode every field must have a value by the end of the constructor, or the compiler reports it.',
            'Assigning each constructor parameter to a field is repetitive. A **parameter property** does both at once: put an access modifier such as `public` in front of a constructor parameter and it becomes a field with that name.',
          ],
          examples: [
            {
              id: 'fields',
              lang: 'ts',
              code: `class Rectangle {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  area(): number {
    return this.width * this.height;
  }
}
const card = new Rectangle(3, 4);
console.log(card.area());`,
              output: ['12'],
            },
            {
              id: 'uninitialised',
              lang: 'ts',
              code: `class Timer {
  seconds: number;
  label: string = 'timer';
  constructor() {}
}
console.log(new Timer().seconds);`,
              output: ['undefined'],
              errors: [{ code: 2564, line: 2 }],
              caption: 'seconds is never given a value, and the compiler says so.',
            },
            {
              id: 'param-props',
              lang: 'ts',
              code: `class Account {
  constructor(public owner: string, private balance: number = 0) {}

  deposit(amount: number): void {
    this.balance += amount;
  }

  report(): string {
    return this.owner + ' has ' + this.balance;
  }
}
const account = new Account('Ada');
account.deposit(50);
console.log(account.report());`,
              output: ['Ada has 50'],
              caption: 'The constructor body is empty. owner and balance are declared and assigned by the parameters.',
            },
          ],
        },
        {
          heading: 'public, private, protected and readonly',
          body: [
            'Members are `public` by default: anyone can use them. `private` limits a member to code inside the class. `protected` also allows subclasses. `readonly` allows assigning only where the field is declared or inside the constructor.',
            'Use `private` to hide details that callers should not depend on, so you can change them later.',
          ],
          examples: [
            {
              id: 'modifiers',
              lang: 'ts',
              code: `class Account {
  readonly id: number;
  private balance = 0;
  protected owner: string;

  constructor(id: number, owner: string) {
    this.id = id;
    this.owner = owner;
  }

  deposit(amount: number): void {
    this.balance += amount;
  }
}

class Savings extends Account {
  describe(): string {
    return this.owner + ' saves';
  }
}

const savings = new Savings(1, 'Ada');
savings.deposit(10);
console.log(savings.describe());
console.log(savings.balance);
console.log(savings.owner);
savings.id = 2;`,
              output: ['Ada saves', '10', 'Ada'],
              errors: [
                { code: 2341, line: 25 },
                { code: 2445, line: 26 },
                { code: 2540, line: 27 },
              ],
              caption: 'Line 18 reads owner inside a subclass, which protected allows. Lines 25 to 27 are outside, so each is an error.',
            },
          ],
          notes: [
            { kind: 'watch-out', text: 'All of these are checked by the compiler only. As the output shows, the program still read the private balance when it ran.' },
          ],
        },
        {
          heading: 'Promising a shape with implements',
          body: [
            'An interface can describe what a class must offer. Write `implements` after the class name and the compiler checks the class has every member the interface lists. The class still has its own extra members.',
            'TypeScript is structural, so a class fits an interface even without `implements`. Writing it just moves the error to the class, where you made the mistake, instead of to the place that uses it.',
          ],
          examples: [
            {
              id: 'implements',
              lang: 'ts',
              code: `interface Printable {
  print(): string;
}

class Invoice implements Printable {
  constructor(private total: number) {}

  print(): string {
    return 'Invoice: ' + this.total;
  }
}

class Receipt implements Printable {
  print(): string {
    return 'Receipt';
  }
}

function printAll(items: Printable[]): void {
  for (const item of items) console.log(item.print());
}
printAll([new Invoice(40), new Receipt()]);`,
              output: ['Invoice: 40', 'Receipt'],
            },
            {
              id: 'implements-missing',
              lang: 'ts',
              code: `interface Printable {
  print(): string;
}

class Poster implements Printable {
  title = 'Sale';
}`,
              errors: [{ code: 2420, line: 5 }],
              caption: 'Poster promised a print method and has none.',
            },
          ],
        },
        {
          heading: 'Abstract classes',
          body: [
            'An `abstract` class is a base that cannot be created directly. It can hold real methods and also declare `abstract` ones that every subclass must write. Use it when several classes share code but each fills in one part differently.',
            'Unlike an interface, an abstract class exists at runtime, so it can carry shared code. Subclasses call `super(...)` in their own constructor.',
          ],
          examples: [
            {
              id: 'abstract',
              lang: 'ts',
              code: `abstract class Employee {
  constructor(protected name: string) {}

  abstract pay(): number;

  summary(): string {
    return this.name + ' earns ' + this.pay();
  }
}

class Salaried extends Employee {
  constructor(name: string, private yearly: number) {
    super(name);
  }

  pay(): number {
    return this.yearly / 12;
  }
}

class Hourly extends Employee {
  constructor(name: string, private rate: number, private hours: number) {
    super(name);
  }

  pay(): number {
    return this.rate * this.hours;
  }
}

const staff: Employee[] = [new Salaried('Ada', 60000), new Hourly('Alan', 20, 40)];
for (const person of staff) console.log(person.summary());`,
              output: ['Ada earns 5000', 'Alan earns 800'],
            },
            {
              id: 'abstract-new',
              lang: 'ts',
              code: `abstract class Animal {
  abstract sound(): string;
}
const pet = new Animal();`,
              errors: [{ code: 2511, line: 4 }],
              caption: 'An abstract class is incomplete, so you cannot create one.',
            },
          ],
        },
        {
          heading: 'A class is also a type',
          body: [
            'The name of a class works as a type: `function show(p: Point)` accepts instances of `Point`. Because TypeScript compares shapes, a plain object with the same public properties fits too.',
            'Private and protected members change that. Two classes are only compatible if those members come from the same declaration, so a `Feet` is not accepted where a `Meters` is expected, even when their public parts match.',
          ],
          examples: [
            {
              id: 'class-type',
              lang: 'ts',
              code: `class Point {
  constructor(public x: number, public y: number) {}
}

function show(p: Point): string {
  return p.x + ',' + p.y;
}
console.log(show(new Point(1, 2)));
console.log(show({ x: 3, y: 4 }));`,
              output: ['1,2', '3,4'],
            },
            {
              id: 'class-private-brand',
              lang: 'ts',
              code: `class Meters {
  private unit = 'm';
  constructor(public value: number) {}
}
class Feet {
  private unit = 'ft';
  constructor(public value: number) {}
}

const distance: Meters = new Feet(3);
console.log(distance.value);`,
              output: ['3'],
              errors: [{ code: 2322, line: 10 }],
              caption: 'A private member makes a class count as its own type. This stops you mixing up units.',
            },
          ],
        },
        {
          heading: 'private versus #private',
          body: [
            'JavaScript has its own privacy: a field whose name starts with `#`. It is enforced by the language while the program runs, and nothing outside the class can read it, not even with brackets.',
            'TypeScript\'s `private` is different. It is checked by the compiler and then removed, so at runtime the field is an ordinary property. Choose `#` when the value must really be hidden, and `private` when you only want the compiler to guide other developers.',
          ],
          examples: [
            {
              id: 'private-vs-hash',
              lang: 'ts',
              code: `class Vault {
  private code = 1234;
  #secret = 'gold';

  reveal(): string {
    return this.#secret;
  }
}
const vault = new Vault();
console.log(vault['code']);
console.log(vault.reveal());`,
              output: ['1234', 'gold'],
              caption: 'Square brackets get past the compiler\'s private check, and the value is really there.',
            },
            {
              id: 'hash-outside',
              lang: 'ts',
              run: false,
              code: `console.log(vault.#secret);
// TS18013: Property '#secret' is not accessible outside class 'Vault'
// JavaScript refuses to run this line at all: it is a SyntaxError.`,
              caption: 'Not run. A # field cannot be reached from outside, by the compiler or by the language.',
            },
          ],
        },
      ],
      recap: [
        'Declare typed fields at the top of the class. In strict mode each must be assigned by the end of the constructor.',
        'A parameter property such as `constructor(private balance: number)` declares and assigns the field in one step.',
        '`public` is the default, `private` is for the class, `protected` adds subclasses, `readonly` allows assignment only in the constructor.',
        '`implements` checks a class against an interface. An `abstract` class cannot be created and forces subclasses to write its abstract methods.',
        '`private` is erased at runtime. `#field` is real JavaScript privacy.',
      ],
      checks: [
        {
          id: 'ts-classes.c1',
          kind: 'mcq',
          prompt: 'Which line is the type error?',
          code: {
            lang: 'ts',
            text: `class Wallet {
  constructor(private coins: number) {}
}
const wallet = new Wallet(5);
console.log(wallet.coins);`,
          },
          options: ['Line 2', 'Line 4', 'Line 5', 'There is no error'],
          answer: 2,
          explanation: 'coins is a private parameter property, so only code inside Wallet may read it. Line 5 is outside the class.',
          review: 'ts-classes',
          verify: { kind: 'ts-error', line: 5, code: 2341 },
        },
        {
          id: 'ts-classes.c2',
          kind: 'short',
          prompt: 'What does this print?',
          code: {
            lang: 'ts',
            text: `class Point {
  constructor(public x: number, public y: number = 0) {}
}
const p = new Point(3);
console.log(p.x, p.y);`,
          },
          accept: ['3 0'],
          explanation: 'The parameter y has a default of 0, and the parameter property stores it as a field.',
          review: 'ts-classes',
          verify: { kind: 'output' },
        },
        {
          id: 'ts-classes.c3',
          kind: 'mcq',
          prompt: 'Which modifier lets a class and its subclasses use a field, but not code outside them?',
          options: ['public', 'readonly', 'private', 'protected'],
          answer: 3,
          explanation: '`protected` is between public and private: the class and its subclasses can use the field, and nothing outside can.',
          review: 'ts-classes',
        },
      ],
      exercises: ['ex-ts-classes-types'],
    },
    {
      id: 'ts-utility',
      title: 'Utility types and type operators',
      summary: 'Build new types from existing ones with keyof, typeof, indexed access and the built-in helper types.',
      minutes: 15,
      objectives: [
        'Read the keys and property types of a type with keyof and T[\'key\']',
        'Get a type from a value with typeof, and from a list with as const',
        'Use Partial, Required and Readonly to adjust a type',
        'Use Pick, Omit and Record to reshape a type',
        'Get a function\'s result and parameter types with ReturnType and Parameters',
      ],
      sections: [
        {
          heading: 'keyof and indexed access',
          body: [
            'Instead of writing a second type by hand, you can derive it from the first, so the two never drift apart. `keyof T` is the union of the property names of `T`. `T[\'key\']` is the type of one property, and it also takes a union of keys.',
            'Together they let a function accept only real property names and return the matching value type.',
          ],
          examples: [
            {
              id: 'keyof',
              lang: 'ts',
              code: `interface Product { id: number; name: string; price: number }

type ProductKey = keyof Product;
type Price = Product['price'];

const key: ProductKey = 'name';
const price: Price = 12;
console.log(key, price);`,
              output: ['name 12'],
              caption: 'ProductKey is "id" | "name" | "price". Price is number.',
            },
            {
              id: 'keyof-fn',
              lang: 'ts',
              code: `interface Product { id: number; name: string; price: number }
function read(product: Product, key: keyof Product): Product[keyof Product] {
  return product[key];
}
const mug: Product = { id: 1, name: 'Mug', price: 8 };
console.log(read(mug, 'price'));
console.log(read(mug, 'title'));`,
              output: ['8', 'undefined'],
              errors: [{ code: 2345, line: 7 }],
              caption: '"title" is not a key of Product, so the call is rejected before it returns undefined.',
            },
          ],
        },
        {
          heading: 'typeof and as const',
          body: [
            'In JavaScript `typeof` gives a string at runtime. In a type position it means something else: `typeof value` is the TypeScript type of that value. It saves you describing a value twice.',
            'On its own, a list like `[\'admin\', \'editor\']` has type `string[]`. Add `as const` and it becomes a read-only list of those exact strings. Then `(typeof roles)[number]` is the union of its items.',
          ],
          examples: [
            {
              id: 'as-const-list',
              lang: 'ts',
              code: `const roles = ['admin', 'editor', 'viewer'] as const;
type Role = (typeof roles)[number];

const mine: Role = 'editor';
console.log(mine, roles.length);
const nope: Role = 'owner';`,
              output: ['editor 3'],
              errors: [{ code: 2322, line: 6 }],
              caption: 'Role is "admin" | "editor" | "viewer", built from the array, so adding a role updates the type.',
            },
            {
              id: 'typeof-object',
              lang: 'ts',
              code: `const defaults = { theme: 'dark', pageSize: 20 };
type Settings = typeof defaults;

function open(settings: Settings): string {
  return settings.theme + ' ' + settings.pageSize;
}
console.log(open(defaults));
console.log(open({ theme: 'light', pageSize: 50 }));`,
              output: ['dark 20', 'light 50'],
              caption: 'Settings is { theme: string; pageSize: number }, copied from the value.',
            },
            {
              id: 'as-const-object',
              lang: 'ts',
              code: `const config = { mode: 'dark', retries: 3 } as const;
type Mode = (typeof config)['mode'];

const mode: Mode = 'dark';
config.retries = 4;
console.log(mode, config.retries);`,
              output: ['dark 4'],
              errors: [{ code: 2540, line: 5 }],
              caption: 'as const makes every property readonly with its exact value as the type.',
            },
          ],
        },
        {
          heading: 'Partial, Required and Readonly',
          body: [
            '`Partial<T>` makes every property of `T` optional. It is the right type for an update: the caller sends only the fields that change. `Required<T>` does the opposite and removes every `?`. `Readonly<T>` makes every property `readonly`.',
            'You write them like a function call on a type. The original type is not changed, you get a new one.',
          ],
          examples: [
            {
              id: 'partial',
              lang: 'ts',
              code: `interface Profile { name: string; bio: string; website?: string }

function updateProfile(profile: Profile, changes: Partial<Profile>): Profile {
  return { ...profile, ...changes };
}

const ada: Profile = { name: 'Ada', bio: 'Mathematician' };
const updated = updateProfile(ada, { bio: 'First programmer' });
console.log(updated.name, updated.bio);`,
              output: ['Ada First programmer'],
            },
            {
              id: 'required-readonly',
              lang: 'ts',
              code: `interface Profile { name: string; bio: string; website?: string }

const full: Required<Profile> = { name: 'Ada', bio: 'Mathematician' };
const frozen: Readonly<Profile> = { name: 'Ada', bio: 'Mathematician' };
frozen.bio = 'Programmer';
console.log(frozen.bio);`,
              output: ['Programmer'],
              errors: [
                { code: 2741, line: 3 },
                { code: 2540, line: 5 },
              ],
              caption: 'Required demands website on line 3. Readonly forbids the assignment on line 5.',
            },
          ],
          notes: [
            { kind: 'watch-out', text: 'These helpers are shallow. `Readonly<T>` does not make a nested object readonly, only the top-level properties.' },
          ],
        },
        {
          heading: 'Pick, Omit and Record',
          body: [
            '`Pick<T, Keys>` keeps only the listed properties. `Omit<T, Keys>` keeps everything except them. Use them to make a smaller view of a bigger type, such as a card for a list or the data for a new record that has no `id` yet.',
            '`Record<Keys, V>` builds an object type with exactly those keys, each holding a `V`. With a union of names as the keys, every key is required.',
          ],
          examples: [
            {
              id: 'pick-omit',
              lang: 'ts',
              code: `interface User { id: number; name: string; email: string; role: 'admin' | 'member' }

type UserCard = Pick<User, 'name' | 'email'>;
type NewUser = Omit<User, 'id'>;

const card: UserCard = { name: 'Ada', email: 'ada@example.com' };
const draft: NewUser = { name: 'Grace', email: 'grace@example.com', role: 'member' };
console.log(card.name, draft.role);`,
              output: ['Ada member'],
            },
            {
              id: 'record',
              lang: 'ts',
              code: `type Role = 'admin' | 'member';

const limits: Record<Role, number> = { admin: 100, member: 10 };
console.log(limits.admin + limits.member);
const missing: Record<Role, number> = { admin: 1 };`,
              output: ['110'],
              errors: [{ code: 2741, line: 5 }],
              caption: 'Every role must appear, so the last line is missing member.',
            },
          ],
          notes: [
            { kind: 'watch-out', text: '`Pick` checks that its keys exist, but `Omit` does not. `Omit<User, \'idd\'>` compiles and quietly leaves every property in place.' },
          ],
        },
        {
          heading: 'ReturnType and Parameters',
          body: [
            'A function already says a lot about its types. `ReturnType<typeof fn>` is what it returns and `Parameters<typeof fn>` is a list of what it takes, in order. Note the `typeof`: these helpers take a type, and `typeof fn` turns the function value into one.',
            'This is handy when a function returns an object you never named. You get the type without writing it out, and it follows the function if the function changes.',
          ],
          examples: [
            {
              id: 'return-params',
              lang: 'ts',
              code: `function createUser(name: string, age: number) {
  return { name, age, active: true };
}

type User = ReturnType<typeof createUser>;
type CreateArgs = Parameters<typeof createUser>;

const args: CreateArgs = ['Ada', 36];
const user: User = createUser(...args);
console.log(user.name, user.active);`,
              output: ['Ada true'],
              caption: 'User is { name: string; age: number; active: boolean }. CreateArgs is [name: string, age: number].',
            },
          ],
        },
      ],
      recap: [
        '`keyof T` is the union of a type\'s keys. `T[\'key\']` is the type of that property.',
        '`typeof value` in a type position gives the type of a value. `as const` keeps exact literals, and `(typeof list)[number]` is the union of a list\'s items.',
        '`Partial`, `Required` and `Readonly` change every property at once. They are shallow.',
        '`Pick` and `Omit` reshape an object type. `Record<Keys, V>` builds one with exactly those keys.',
        '`ReturnType<typeof fn>` and `Parameters<typeof fn>` read a function\'s types, so you do not write them twice.',
      ],
      checks: [
        {
          id: 'ts-utility.c1',
          kind: 'mcq',
          prompt: 'Which line is the type error?',
          code: {
            lang: 'ts',
            text: `interface Task { id: number; title: string; done: boolean }
type TaskPreview = Pick<Task, 'id' | 'title'>;
const a: TaskPreview = { id: 1, title: 'Write' };
const b: TaskPreview = { id: 2, title: 'Test', done: true };`,
          },
          options: ['Line 2', 'Line 3', 'Line 4', 'There is no error'],
          answer: 2,
          explanation: 'Pick keeps only id and title. The literal on line 4 adds done, which TaskPreview no longer has.',
          review: 'ts-utility',
          verify: { kind: 'ts-error', line: 4, code: 2353 },
        },
        {
          id: 'ts-utility.c2',
          kind: 'short',
          prompt: 'What does this print?',
          code: {
            lang: 'ts',
            text: `const prices = { tea: 3, coffee: 4 };
type Item = keyof typeof prices;
const order: Item[] = ['tea', 'coffee', 'tea'];
let total = 0;
for (const item of order) total += prices[item];
console.log(total);`,
          },
          accept: ['10'],
          explanation: 'Item is "tea" | "coffee", so each name is a valid key of prices: 3 + 4 + 3.',
          review: 'ts-utility',
          verify: { kind: 'output' },
        },
        {
          id: 'ts-utility.c3',
          kind: 'mcq',
          prompt: 'What does `Partial<User>` describe?',
          options: [
            'A User with only some of its properties removed for good',
            'An object where every property of User is optional',
            'A User whose properties cannot be changed',
            'The keys of User as a union',
          ],
          answer: 1,
          explanation: 'Partial keeps every property of User but marks each one optional, which suits an update that sends only what changed. The other options describe Pick or Omit, Readonly and keyof.',
          review: 'ts-utility',
        },
      ],
      exercises: ['ex-ts-utility-run', 'ex-ts-utility-types'],
    },
  ],
  exam: [
    {
      id: 'ts-shapes.e1',
      kind: 'mcq',
      prompt: 'Which line is the type error?',
      code: {
        lang: 'ts',
        text: `interface Settings { readonly theme: string; fontSize?: number }
const settings: Settings = { theme: 'dark' };
settings.fontSize = 14;
settings.theme = 'light';`,
      },
      options: ['Line 2', 'Line 3', 'Line 4', 'There is no error'],
      answer: 2,
      explanation: 'fontSize is optional and not readonly, so line 3 is fine. theme is readonly, so line 4 cannot assign to it.',
      review: 'ts-objects',
      verify: { kind: 'ts-error', line: 4, code: 2540 },
    },
    {
      id: 'ts-shapes.e2',
      kind: 'short',
      prompt: 'What does this print?',
      code: {
        lang: 'ts',
        text: `const votes: { [name: string]: number } = { ada: 2 };
votes.grace = 5;
votes.ada += 1;
console.log(Object.keys(votes).length, votes.ada + votes.grace);`,
      },
      accept: ['2 8'],
      explanation: 'The index signature allows the new key grace, so there are two keys. ada becomes 3, and 3 + 5 is 8.',
      review: 'ts-objects',
      verify: { kind: 'output' },
    },
    {
      id: 'ts-shapes.e3',
      kind: 'mcq',
      prompt: 'Which line is the type error?',
      code: {
        lang: 'ts',
        text: `type Light = { color: 'red' } | { color: 'green'; secondsLeft: number };
function wait(light: Light): number {
  if (light.color === 'green') return light.secondsLeft;
  return light.secondsLeft;
}`,
      },
      options: ['There is no error', 'Line 2', 'Line 3', 'Line 4'],
      answer: 3,
      explanation: 'After the green case returns, only the red light is left, and a red light has no secondsLeft.',
      review: 'ts-unions',
      verify: { kind: 'ts-error', line: 4, code: 2339 },
    },
    {
      id: 'ts-shapes.e4',
      kind: 'short',
      prompt: 'What does this print?',
      code: {
        lang: 'ts',
        text: `type Command = { type: 'add'; n: number } | { type: 'double' } | { type: 'reset' };
const commands: Command[] = [
  { type: 'add', n: 3 },
  { type: 'double' },
  { type: 'add', n: 1 },
  { type: 'reset' },
  { type: 'add', n: 4 },
];
let value = 1;
for (const command of commands) {
  switch (command.type) {
    case 'add':
      value += command.n;
      break;
    case 'double':
      value *= 2;
      break;
    case 'reset':
      value = 0;
      break;
  }
}
console.log(value);`,
      },
      accept: ['4'],
      explanation: 'The value goes 1, 4, 8, 9, then reset to 0, then 4.',
      review: 'ts-unions',
      verify: { kind: 'output' },
    },
    {
      id: 'ts-shapes.e5',
      kind: 'mcq',
      prompt: 'Which line is the type error?',
      code: {
        lang: 'ts',
        text: `class Vehicle { protected wheels = 4; }
class Bike extends Vehicle { count() { return this.wheels - 2; } }
const bike = new Bike();
console.log(bike.wheels);`,
      },
      options: ['Line 2', 'Line 4', 'Line 1', 'There is no error'],
      answer: 1,
      explanation: 'A subclass may read a protected field, so line 2 is fine. Line 4 is outside the class hierarchy, so it is rejected.',
      review: 'ts-classes',
      verify: { kind: 'ts-error', line: 4, code: 2445 },
    },
    {
      id: 'ts-shapes.e6',
      kind: 'mcq',
      prompt: 'Which one still hides a field from other code after the TypeScript has been compiled to JavaScript and is running?',
      options: ['private', 'protected', '#field', 'readonly'],
      answer: 2,
      explanation: 'private, protected and readonly are removed with the other types. A `#field` is real JavaScript privacy, so the language itself enforces it.',
      review: 'ts-classes',
    },
    {
      id: 'ts-shapes.e7',
      kind: 'mcq',
      prompt: 'Which line is the type error?',
      code: {
        lang: 'ts',
        text: `const config = { mode: 'dark', size: 2 } as const;
type Mode = (typeof config)['mode'];
const a: Mode = 'dark';
const b: Mode = 'light';
const c: Mode = config.mode;`,
      },
      options: ['Line 4', 'Line 3', 'Line 5', 'There is no error'],
      answer: 0,
      explanation: 'With as const, mode has the exact type "dark", so Mode only allows "dark". Line 4 tries "light".',
      review: 'ts-utility',
      verify: { kind: 'ts-error', line: 4, code: 2322 },
    },
    {
      id: 'ts-shapes.e8',
      kind: 'short',
      prompt: 'What does this print?',
      code: {
        lang: 'ts',
        text: `function makeOrder(item: string, qty: number) {
  return { item, qty, paid: false };
}
type Order = ReturnType<typeof makeOrder>;
const order: Order = makeOrder('tea', 2);
const args: Parameters<typeof makeOrder> = ['tea', 3];
console.log(order.qty + args[1]);`,
      },
      accept: ['5'],
      explanation: 'order.qty is 2 and the second item of args is 3, so the sum is 5.',
      review: 'ts-utility',
      verify: { kind: 'output' },
    },
  ],
  bonus: [
    {
      id: 'ts-shapes.b1',
      kind: 'mcq',
      prompt: 'Which line is the type error?',
      code: {
        lang: 'ts',
        text: `type AppEvent = { type: 'click'; x: number } | { type: 'key'; code: string };
type EventType = AppEvent['type'];
const a: EventType = 'click';
const b: EventType = 'key';
const c: EventType = 'scroll';`,
      },
      options: ['Line 3', 'Line 4', 'Line 5', 'There is no error'],
      answer: 2,
      explanation: 'Indexing a union with the tag gives the union of all its tags, "click" | "key". "scroll" is not one of them.',
      review: 'ts-utility',
      verify: { kind: 'ts-error', line: 5, code: 2322 },
    },
    {
      id: 'ts-shapes.b2',
      kind: 'mcq',
      prompt: 'Which line is the type error?',
      code: {
        lang: 'ts',
        text: `interface User { id: number; name: string; email: string }
type Patch = Partial<Pick<User, 'name' | 'email'>>;
const a: Patch = {};
const b: Patch = { email: 'ada@example.com' };
const c: Patch = { id: 3 };`,
      },
      options: ['Line 3', 'Line 4', 'There is no error', 'Line 5'],
      answer: 3,
      explanation: 'Pick leaves name and email, and Partial makes both optional, so {} and a lone email are fine. id was picked away, so line 5 has an unknown property.',
      review: 'ts-utility',
      verify: { kind: 'ts-error', line: 5, code: 2353 },
    },
    {
      id: 'ts-shapes.b3',
      kind: 'mcq',
      prompt: 'Euro and Dollar have the same public property, yet line 7 is an error. Why?',
      code: {
        lang: 'ts',
        text: `class Euro {
  constructor(public amount: number, private currency = 'EUR') {}
}
class Dollar {
  constructor(public amount: number, private currency = 'USD') {}
}
const price: Euro = new Dollar(5);`,
      },
      options: [
        'Classes can never be assigned to each other',
        'amount is not readonly',
        'Private members come from separate declarations, so the classes are not compatible',
        'Dollar needs an implements clause',
      ],
      answer: 2,
      explanation: 'Plain public shapes are compared structurally, but a private member only matches when it comes from the same declaration. That keeps the two currencies apart.',
      review: 'ts-classes',
      verify: { kind: 'ts-error', line: 7, code: 2322 },
    },
    {
      id: 'ts-shapes.b4',
      kind: 'short',
      prompt: 'What does this print?',
      code: {
        lang: 'ts',
        text: `type Shape = { kind: 'circle'; r: number } | { kind: 'rect'; w: number; h: number };
const sides: Record<Shape['kind'], number> = { circle: 0, rect: 4 };
const shapes: Shape[] = [
  { kind: 'rect', w: 1, h: 1 },
  { kind: 'circle', r: 2 },
  { kind: 'rect', w: 2, h: 2 },
];
console.log(shapes.reduce((count, shape) => count + sides[shape.kind], 0));`,
      },
      accept: ['8'],
      explanation: 'Shape[\'kind\'] is "circle" | "rect", so sides has a value for each tag. The two rects give 4 each and the circle gives 0.',
      review: 'ts-unions',
      verify: { kind: 'output' },
    },
  ],
};
