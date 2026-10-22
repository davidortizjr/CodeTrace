import type { Problem, Variant } from '../../problems/types.js';
import type { ErrorTypeId } from '../../engine/errors.js';

function v(id: string, type: ErrorTypeId, label: string, why: string, fix: string, ask: string[], code: string): Variant {
  return { id, type, label, why, fix, ask, code };
}

export const U6_EXERCISES: Problem[] = [
  {
    id: 'ex-ts-objects-run',
    topic: 'ts-shapes',
    lang: 'ts',
    lesson: 'ts-objects',
    title: 'Shipping label',
    difficulty: 1,
    prompt:
      'The `Order` shape is given. Write `shippingLabel(order)` that returns `"<name>, <city>"`, for example `Ada, Manila`. If the order has a `note`, add it at the end in brackets: `Ada, Manila (fragile)`. An order without a note must not mention one.',
    concept: 'Reading an optional property safely, and passing an object that matches a named shape.',
    fn: 'shippingLabel',
    starter: `interface Order {
  name: string;
  city: string;
  note?: string;
}

function shippingLabel(order: Order): string {
  // return "name, city", plus " (note)" when there is a note
}
`,
    reference: `interface Order {
  name: string;
  city: string;
  note?: string;
}

function shippingLabel(order: Order): string {
  const label = order.name + ', ' + order.city;
  if (order.note !== undefined) {
    return label + ' (' + order.note + ')';
  }
  return label;
}`,
    tests: [
      { args: [{ name: 'Ada', city: 'Manila' }], cat: 'basic' },
      { args: [{ name: 'Grace', city: 'Cebu', note: 'fragile' }], cat: 'basic' },
      { args: [{ name: 'Alan', city: 'Davao', note: 'leave at the door' }], cat: 'basic' },
      { args: [{ name: 'Linus', city: 'Baguio' }], cat: 'basic' },
      { args: [{ name: 'Mae', city: 'Iloilo', note: '' }], cat: 'edge' },
    ],
    traceArgs: [{ name: 'Grace', city: 'Cebu', note: 'fragile' }],
    track: [],
    variants: [
      v(
        'ignores-note',
        'logic',
        'The note is never added',
        'The function builds the name and city part and returns it, so an order with a note loses its note.',
        'Check whether the note exists and, if so, add it in brackets.',
        ['What should the result be when `note` is "fragile"?'],
        `interface Order {
  name: string;
  city: string;
  note?: string;
}

function shippingLabel(order: Order): string {
  return order.name + ', ' + order.city;
}`,
      ),
      v(
        'always-note',
        'ts-null',
        'Adds the note even when there is none',
        'An optional property reads as undefined when it is missing, so the label ends with "(undefined)".',
        'Only add the brackets when the note is present.',
        ['What does `order.note` hold when the order has no note?'],
        `interface Order {
  name: string;
  city: string;
  note?: string;
}

function shippingLabel(order: Order): string {
  return order.name + ', ' + order.city + ' (' + order.note + ')';
}`,
      ),
      v(
        'truthy-note',
        'edge-case',
        'An empty note still counts as a note',
        'Checking `if (order.note)` treats the empty string as missing, but the expected label keeps the empty brackets for a note that is present.',
        'Compare the note with undefined instead of testing whether it is truthy.',
        ['What is the difference between a missing note and an empty one?'],
        `interface Order {
  name: string;
  city: string;
  note?: string;
}

function shippingLabel(order: Order): string {
  if (order.note) {
    return order.name + ', ' + order.city + ' (' + order.note + ')';
  }
  return order.name + ', ' + order.city;
}`,
      ),
      v(
        'unchecked-note',
        'ts-null',
        'Reads the note without checking that it exists',
        'The note may be missing, so TypeScript reports that it is possibly undefined, and at runtime an order without a note crashes.',
        'Check that the note is not undefined before using it.',
        ['What type does `order.note` have, with the question mark?', 'What happens to `.length` on undefined?'],
        `interface Order {
  name: string;
  city: string;
  note?: string;
}

function shippingLabel(order: Order): string {
  const label = order.name + ', ' + order.city;
  if (order.note.length >= 0) {
    return label + ' (' + order.note + ')';
  }
  return label;
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-objects-types',
    topic: 'ts-shapes',
    lang: 'ts',
    mode: 'types',
    lesson: 'ts-objects',
    title: 'Describe a ticket',
    difficulty: 1,
    prompt:
      'Fill in the `Ticket` interface. A ticket has a number `id` that must never be reassigned, a string `seat` that can change, and an optional string `note`. Valid tickets must be accepted. A ticket with a missing id, an unknown property or a changed id must be rejected. Do not use `any`.',
    concept: 'A shape needs the right required, optional and readonly properties, and no loose escape hatches, to reject mistakes.',
    fn: 'Ticket',
    starter: `interface Ticket {
  // id: a number that is never reassigned
  // seat: a string
  // note: an optional string
}

function seatOf(ticket: Ticket): string {
  return ticket.seat;
}
`,
    reference: `interface Ticket {
  readonly id: number;
  seat: string;
  note?: string;
}

function seatOf(ticket: Ticket): string {
  return ticket.seat;
}`,
    typeChecks: [
      { label: 'A ticket with an id and a seat is accepted', code: `const t: Ticket = { id: 1, seat: '12A' };\nconst s: string = seatOf(t);\nvoid s;`, cat: 'basic' },
      { label: 'The note is optional but accepted when given', code: `const t: Ticket = { id: 2, seat: '3C', note: 'aisle' };\nvoid t;`, cat: 'basic' },
      { label: 'The seat can be changed', code: `const t: Ticket = { id: 3, seat: '1A' };\nt.seat = '1B';\nvoid t;`, cat: 'basic' },
      { label: 'The id cannot be changed', code: `const t: Ticket = { id: 4, seat: '1A' };\n// @ts-expect-error\nt.id = 5;`, cat: 'basic' },
      { label: 'A ticket without an id is rejected', code: `// @ts-expect-error\nconst t: Ticket = { seat: '1A' };\nvoid t;`, cat: 'basic' },
      { label: 'An unknown property is rejected', code: `// @ts-expect-error\nconst t: Ticket = { id: 6, seat: '1A', colour: 'red' };\nvoid t;`, cat: 'edge' },
      { label: 'A text id is rejected', code: `// @ts-expect-error\nconst t: Ticket = { id: 'six', seat: '1A' };\nvoid t;`, cat: 'edge' },
    ],
    tests: [],
    traceArgs: [],
    track: [],
    variants: [
      v(
        'not-readonly',
        'ts-too-loose',
        'The id can still be changed',
        'The id is a plain property, so assigning to it is accepted and the check that expects an error fails.',
        'Put a modifier in front of id so it cannot be reassigned.',
        ['Which keyword forbids changing a property after the object is made?'],
        `interface Ticket {
  id: number;
  seat: string;
  note?: string;
}

function seatOf(ticket: Ticket): string {
  return ticket.seat;
}`,
      ),
      v(
        'note-required',
        'ts-missing-prop',
        'The note is required',
        'Without a question mark the note must be given every time, so a ticket with only an id and a seat is rejected.',
        'Mark note as optional.',
        ['What goes after the property name to make it optional?'],
        `interface Ticket {
  readonly id: number;
  seat: string;
  note: string;
}

function seatOf(ticket: Ticket): string {
  return ticket.seat;
}`,
      ),
      v(
        'id-string',
        'ts-mismatch',
        'The id is typed as a string',
        'A ticket with a number id no longer matches the shape, so the valid tickets are rejected.',
        'The id is a number.',
        ['What type is the value `1` in `{ id: 1 }`?'],
        `interface Ticket {
  readonly id: string;
  seat: string;
  note?: string;
}

function seatOf(ticket: Ticket): string {
  return ticket.seat;
}`,
      ),
      v(
        'index-signature',
        'ts-too-loose',
        'An index signature lets any property in',
        'The extra index signature accepts every unknown property, so the mistake is not reported. Name the properties you want and nothing else.',
        'Remove the index signature and list only id, seat and note.',
        ['Why would an unknown property such as colour be accepted?'],
        `interface Ticket {
  readonly id: number;
  seat: string;
  note?: string;
  [key: string]: string | number | undefined;
}

function seatOf(ticket: Ticket): string {
  return ticket.seat;
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-unions-run',
    topic: 'ts-shapes',
    lang: 'ts',
    lesson: 'ts-unions',
    title: 'Postage cost',
    difficulty: 1,
    prompt:
      'A parcel is one of three shapes (given). Write `postage(parcel)` that returns the cost: a `letter` costs 2, a `box` costs 5 plus 2 for every kilogram, and a `pickup` is free (0). Example: a box of 3 kg costs 11.',
    concept: 'Check the tag of a discriminated union so each branch can use the properties of its own member.',
    fn: 'postage',
    starter: `type Parcel =
  | { kind: 'letter' }
  | { kind: 'box'; kg: number }
  | { kind: 'pickup' };

function postage(parcel: Parcel): number {
  // check parcel.kind and return the cost for each kind
}
`,
    reference: `type Parcel =
  | { kind: 'letter' }
  | { kind: 'box'; kg: number }
  | { kind: 'pickup' };

function postage(parcel: Parcel): number {
  switch (parcel.kind) {
    case 'letter':
      return 2;
    case 'box':
      return 5 + 2 * parcel.kg;
    case 'pickup':
      return 0;
  }
}`,
    tests: [
      { args: [{ kind: 'letter' }], cat: 'basic' },
      { args: [{ kind: 'box', kg: 3 }], cat: 'basic' },
      { args: [{ kind: 'pickup' }], cat: 'basic' },
      { args: [{ kind: 'box', kg: 0 }], cat: 'edge' },
      { args: [{ kind: 'box', kg: 10 }], cat: 'basic' },
      { args: [{ kind: 'box', kg: 1.5 }], cat: 'edge' },
    ],
    traceArgs: [{ kind: 'box', kg: 3 }],
    track: [],
    variants: [
      v(
        'flat-box',
        'logic',
        'A box costs a flat 5',
        'The weight is never used, so every box costs 5 whatever it weighs.',
        'Add 2 for every kilogram: use the box member\'s kg.',
        ['Which property tells you how heavy the box is?'],
        `type Parcel =
  | { kind: 'letter' }
  | { kind: 'box'; kg: number }
  | { kind: 'pickup' };

function postage(parcel: Parcel): number {
  switch (parcel.kind) {
    case 'letter':
      return 2;
    case 'box':
      return 5;
    case 'pickup':
      return 0;
  }
}`,
      ),
      v(
        'pickup-costs',
        'logic',
        'A pickup is charged like a letter',
        'The pickup case returns 2, but collecting a parcel yourself is free.',
        'Return 0 for a pickup.',
        ['What does the prompt say a pickup costs?'],
        `type Parcel =
  | { kind: 'letter' }
  | { kind: 'box'; kg: number }
  | { kind: 'pickup' };

function postage(parcel: Parcel): number {
  switch (parcel.kind) {
    case 'letter':
      return 2;
    case 'box':
      return 5 + 2 * parcel.kg;
    case 'pickup':
      return 2;
  }
}`,
      ),
      v(
        'kg-outside-check',
        'ts-narrowing',
        'Reads kg without checking the kind',
        'Only the box member has kg. Reading it before you know you hold a box is a type error, and for other kinds it gives NaN.',
        'Read kg inside the branch that has checked parcel.kind is "box".',
        ['Do letters and pickups have a kg property?', 'Where does TypeScript know you hold a box?'],
        `type Parcel =
  | { kind: 'letter' }
  | { kind: 'box'; kg: number }
  | { kind: 'pickup' };

function postage(parcel: Parcel): number {
  const weight = parcel.kg;
  if (parcel.kind === 'letter') return 2;
  if (parcel.kind === 'pickup') return 0;
  return 5 + 2 * weight;
}`,
      ),
      v(
        'no-pickup-case',
        'control-flow',
        'The pickup case is missing',
        'A pickup matches no case, so the function falls off the end and returns undefined. The compiler also reports that not every path returns a value.',
        'Add a case for pickup.',
        ['What happens to a parcel whose kind has no case?'],
        `type Parcel =
  | { kind: 'letter' }
  | { kind: 'box'; kg: number }
  | { kind: 'pickup' };

function postage(parcel: Parcel): number {
  switch (parcel.kind) {
    case 'letter':
      return 2;
    case 'box':
      return 5 + 2 * parcel.kg;
  }
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-unions-types',
    topic: 'ts-shapes',
    lang: 'ts',
    mode: 'types',
    lesson: 'ts-unions',
    title: 'Success or failure',
    difficulty: 2,
    prompt:
      'The `Result` type is loose, so `unwrap` does not compile. Rewrite `Result` as a discriminated union tagged by `ok`: `{ ok: true; value: number }` or `{ ok: false; error: string }`. Then `unwrap` compiles and impossible results, such as a success with an error message, are rejected. Do not use `any`.',
    concept: 'A discriminated union makes impossible combinations unwritable and lets a check of the tag narrow the value.',
    fn: 'unwrap',
    starter: `type Result = { ok: boolean; value?: number; error?: string };

function unwrap(result: Result): number {
  if (result.ok) {
    return result.value;
  }
  throw new Error(result.error);
}
`,
    reference: `type Result = { ok: true; value: number } | { ok: false; error: string };

function unwrap(result: Result): number {
  if (result.ok) {
    return result.value;
  }
  throw new Error(result.error);
}`,
    typeChecks: [
      { label: 'A success with a value is accepted', code: `const r: Result = { ok: true, value: 3 };\nconst n: number = unwrap(r);\nvoid n;`, cat: 'basic' },
      { label: 'A failure with an error message is accepted', code: `const r: Result = { ok: false, error: 'timeout' };\nvoid r;`, cat: 'basic' },
      { label: 'A success without a value is rejected', code: `// @ts-expect-error\nconst r: Result = { ok: true };\nvoid r;`, cat: 'basic' },
      { label: 'A success carrying an error message is rejected', code: `// @ts-expect-error\nconst r: Result = { ok: true, value: 1, error: 'boom' };\nvoid r;`, cat: 'edge' },
      { label: 'A failure carrying a value is rejected', code: `// @ts-expect-error\nconst r: Result = { ok: false, error: 'boom', value: 1 };\nvoid r;`, cat: 'edge' },
      { label: 'A failure without an error message is rejected', code: `// @ts-expect-error\nconst r: Result = { ok: false };\nvoid r;`, cat: 'basic' },
    ],
    tests: [],
    traceArgs: [],
    track: [],
    variants: [
      v(
        'boolean-tag',
        'ts-narrowing',
        'The tag is a plain boolean, so nothing is narrowed',
        'With `ok: boolean` in both members, checking ok does not tell TypeScript which member you hold, so reading value is an error.',
        'Give the tag literal types: true on one member and false on the other.',
        ['What is the type of `ok` in each member?', 'Can the compiler tell the members apart by it?'],
        `type Result = { ok: boolean; value: number } | { ok: boolean; error: string };

function unwrap(result: Result): number {
  if (result.ok) {
    return result.value;
  }
  throw new Error(result.error);
}`,
      ),
      v(
        'optional-pieces',
        'ts-null',
        'The value and the error are still optional',
        'Even with literal tags, an optional value may be undefined, so unwrap cannot return it as a number.',
        'The value is required when ok is true, and so is the error when ok is false.',
        ['Is a success always guaranteed to have a value?'],
        `type Result = { ok: true; value?: number } | { ok: false; error?: string };

function unwrap(result: Result): number {
  if (result.ok) {
    return result.value;
  }
  throw new Error(result.error);
}`,
      ),
      v(
        'success-with-error',
        'ts-too-loose',
        'A success may still carry an error message',
        'The success member has an optional error, so a success with an error message is accepted and the check that expects a rejection fails.',
        'Give each member only the properties that belong to it.',
        ['Which member should be allowed to have an `error`?'],
        `type Result = { ok: true; value: number; error?: string } | { ok: false; error: string };

function unwrap(result: Result): number {
  if (result.ok) {
    return result.value;
  }
  throw new Error(result.error);
}`,
      ),
      v(
        'all-required',
        'ts-missing-prop',
        'Every property is required on one object',
        'Requiring value and error together means a plain success or a plain failure is missing a property and is rejected.',
        'Split it into two members, one for each outcome.',
        ['Should a success have to supply an error message?'],
        `type Result = { ok: boolean; value: number; error: string };

function unwrap(result: Result): number {
  if (result.ok) {
    return result.value;
  }
  throw new Error(result.error);
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-classes-types',
    topic: 'ts-shapes',
    lang: 'ts',
    mode: 'types',
    lesson: 'ts-classes',
    title: 'A guarded account',
    difficulty: 2,
    prompt:
      'Write the class `Account`. Its constructor takes a number `id` (required, and it can never be reassigned) and an optional starting `balance` that defaults to 0 and is private. It has `deposit(amount: number): void` and `getBalance(): number`. Code outside the class must not read the balance, change the id or pass a text amount. Do not use `any`.',
    concept: 'Access modifiers, readonly and typed methods are what make a class reject misuse.',
    fn: 'Account',
    starter: `class Account {
  // constructor(id, optional balance), deposit(amount) and getBalance()
}
`,
    reference: `class Account {
  constructor(
    public readonly id: number,
    private balance: number = 0,
  ) {}

  deposit(amount: number): void {
    this.balance += amount;
  }

  getBalance(): number {
    return this.balance;
  }
}`,
    typeChecks: [
      {
        label: 'An account can be made with only an id',
        code: `const a = new Account(1);\nconst id: number = a.id;\nvoid id;`,
        cat: 'basic',
      },
      {
        label: 'deposit changes what getBalance returns',
        code: `const a = new Account(2, 20);\na.deposit(5);\nconst total: number = a.getBalance();\nvoid total;`,
        cat: 'basic',
      },
      { label: 'The balance is private', code: `const a = new Account(3);\n// @ts-expect-error\nconsole.log(a.balance);`, cat: 'basic' },
      { label: 'The id cannot be changed', code: `const a = new Account(4);\n// @ts-expect-error\na.id = 5;`, cat: 'basic' },
      { label: 'A text amount is rejected', code: `const a = new Account(5);\n// @ts-expect-error\na.deposit('10');`, cat: 'basic' },
      { label: 'The id is required', code: `// @ts-expect-error\nconst a = new Account();\nvoid a;`, cat: 'edge' },
    ],
    tests: [],
    traceArgs: [],
    track: [],
    variants: [
      v(
        'public-balance',
        'ts-too-loose',
        'The balance is public',
        'Without private, any code can read the balance, so the check that expects an error fails.',
        'Put the private modifier on the balance.',
        ['Which modifier limits a member to code inside the class?'],
        `class Account {
  constructor(
    public readonly id: number,
    public balance: number = 0,
  ) {}

  deposit(amount: number): void {
    this.balance += amount;
  }

  getBalance(): number {
    return this.balance;
  }
}`,
      ),
      v(
        'mutable-id',
        'ts-too-loose',
        'The id can be reassigned',
        'The id is a plain public field, so assigning to it from outside is accepted.',
        'Add readonly to the id.',
        ['What stops a field being reassigned after the object is made?'],
        `class Account {
  constructor(
    public id: number,
    private balance: number = 0,
  ) {}

  deposit(amount: number): void {
    this.balance += amount;
  }

  getBalance(): number {
    return this.balance;
  }
}`,
      ),
      v(
        'amount-implicit-any',
        'ts-implicit-any',
        'The amount has no type',
        'In strict mode a parameter without a type is an error, and the amount would accept a string.',
        'Give amount the type number.',
        ['What type should an amount of money have?'],
        `class Account {
  constructor(
    public readonly id: number,
    private balance: number = 0,
  ) {}

  deposit(amount): void {
    this.balance += amount;
  }

  getBalance(): number {
    return this.balance;
  }
}`,
      ),
      v(
        'id-defaulted',
        'ts-too-loose',
        'The id has a default, so it is no longer required',
        'With a default value the id becomes optional, so creating an account with no id is accepted.',
        'Only the balance gets a default. The id has none.',
        ['Which constructor parameter should be allowed to be left out?'],
        `class Account {
  constructor(
    public readonly id: number = 0,
    private balance: number = 0,
  ) {}

  deposit(amount: number): void {
    this.balance += amount;
  }

  getBalance(): number {
    return this.balance;
  }
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-utility-run',
    topic: 'ts-shapes',
    lang: 'ts',
    lesson: 'ts-utility',
    title: 'Count by role',
    difficulty: 1,
    prompt:
      'Write `countByRole(users)` that returns how many users have each role, as an object with all three keys: `{ admin: 1, member: 2, guest: 0 }`. A role nobody has must still appear, with 0. The return type is `Record<Role, number>`.',
    concept: 'Record<Keys, V> describes an object with exactly one value for every key, so none can be left out.',
    fn: 'countByRole',
    starter: `type Role = 'admin' | 'member' | 'guest';

interface User {
  name: string;
  role: Role;
}

function countByRole(users: User[]): Record<Role, number> {
  // start every role at 0, then count each user under their role
}
`,
    reference: `type Role = 'admin' | 'member' | 'guest';

interface User {
  name: string;
  role: Role;
}

function countByRole(users: User[]): Record<Role, number> {
  const counts: Record<Role, number> = { admin: 0, member: 0, guest: 0 };
  for (const user of users) {
    counts[user.role] += 1;
  }
  return counts;
}`,
    tests: [
      { args: [[{ name: 'Ada', role: 'admin' }, { name: 'Alan', role: 'member' }, { name: 'Grace', role: 'member' }]], cat: 'basic' },
      { args: [[{ name: 'Mae', role: 'guest' }, { name: 'Lin', role: 'guest' }, { name: 'Sam', role: 'guest' }]], cat: 'basic' },
      { args: [[]], cat: 'edge' },
      { args: [[{ name: 'Ada', role: 'admin' }]], cat: 'edge' },
      { args: [[{ name: 'A', role: 'admin' }, { name: 'B', role: 'member' }, { name: 'C', role: 'guest' }, { name: 'D', role: 'member' }, { name: 'E', role: 'admin' }]], cat: 'basic' },
    ],
    traceArgs: [[{ name: 'Ada', role: 'admin' }, { name: 'Alan', role: 'member' }]],
    track: [],
    variants: [
      v(
        'assign-one',
        'logic',
        'Sets the count to 1 instead of adding',
        'Assigning 1 each time means a role never counts above one user.',
        'Add one to the count that is already there.',
        ['What should the count be after two members?'],
        `type Role = 'admin' | 'member' | 'guest';

interface User {
  name: string;
  role: Role;
}

function countByRole(users: User[]): Record<Role, number> {
  const counts: Record<Role, number> = { admin: 0, member: 0, guest: 0 };
  for (const user of users) {
    counts[user.role] = 1;
  }
  return counts;
}`,
      ),
      v(
        'missing-zero',
        'edge-case',
        'Roles nobody has are left out',
        'The object starts empty, so a role with no users is never set and has no key at all, instead of 0.',
        'Start with every role set to 0.',
        ['What does the result hold for the guest role when no guest exists?'],
        `type Role = 'admin' | 'member' | 'guest';

interface User {
  name: string;
  role: Role;
}

function countByRole(users: User[]): Record<Role, number> {
  const counts = {} as Record<Role, number>;
  for (const user of users) {
    counts[user.role] = (counts[user.role] ?? 0) + 1;
  }
  return counts;
}`,
      ),
      v(
        'all-members',
        'logic',
        'Counts every user as a member',
        'The role of the user is ignored and everyone is added under member.',
        'Use the user\'s own role as the key.',
        ['Which key should be increased for an admin?'],
        `type Role = 'admin' | 'member' | 'guest';

interface User {
  name: string;
  role: Role;
}

function countByRole(users: User[]): Record<Role, number> {
  const counts: Record<Role, number> = { admin: 0, member: 0, guest: 0 };
  for (const user of users) {
    counts.member += 1;
  }
  return counts;
}`,
      ),
      v(
        'missing-key',
        'ts-missing-prop',
        'The starting object has no guest key',
        'Record<Role, number> needs all three keys, so the compiler reports the missing guest, and adding to it gives NaN.',
        'List admin, member and guest in the starting object.',
        ['How many keys does Record<Role, number> require?'],
        `type Role = 'admin' | 'member' | 'guest';

interface User {
  name: string;
  role: Role;
}

function countByRole(users: User[]): Record<Role, number> {
  const counts: Record<Role, number> = { admin: 0, member: 0 };
  for (const user of users) {
    counts[user.role] += 1;
  }
  return counts;
}`,
      ),
    ],
  },
  {
    id: 'ex-ts-utility-types',
    topic: 'ts-shapes',
    lang: 'ts',
    mode: 'types',
    lesson: 'ts-utility',
    title: 'New users and patches',
    difficulty: 2,
    prompt:
      'Define `NewUser` and `UserPatch` from `User` with utility types, without retyping its properties. A `NewUser` is a user that has no `id` yet. A `UserPatch` may contain any of `name` and `email`, but never the `id`, and may be empty. Do not use `any`.',
    concept: 'Combine Omit and Partial to derive new shapes from one source type.',
    fn: 'applyPatch',
    starter: `interface User {
  id: number;
  name: string;
  email: string;
}

type NewUser = User; // a User without an id
type UserPatch = User; // some of name and email, never the id

function applyPatch(user: User, patch: UserPatch): User {
  return { ...user, ...patch };
}
`,
    reference: `interface User {
  id: number;
  name: string;
  email: string;
}

type NewUser = Omit<User, 'id'>;
type UserPatch = Partial<Omit<User, 'id'>>;

function applyPatch(user: User, patch: UserPatch): User {
  return { ...user, ...patch };
}`,
    typeChecks: [
      { label: 'A NewUser has a name and an email', code: `const n: NewUser = { name: 'Ada', email: 'ada@example.com' };\nvoid n;`, cat: 'basic' },
      { label: 'A NewUser must not have an id', code: `// @ts-expect-error\nconst n: NewUser = { id: 1, name: 'Ada', email: 'ada@example.com' };\nvoid n;`, cat: 'basic' },
      { label: 'A NewUser needs both name and email', code: `// @ts-expect-error\nconst n: NewUser = { name: 'Ada' };\nvoid n;`, cat: 'edge' },
      { label: 'A patch may change only the email, or nothing', code: `const a: UserPatch = { email: 'new@example.com' };\nconst b: UserPatch = {};\nvoid a;\nvoid b;`, cat: 'basic' },
      { label: 'A patch can never contain the id', code: `// @ts-expect-error\nconst p: UserPatch = { id: 5 };\nvoid p;`, cat: 'basic' },
      { label: 'A patch value must keep the right type', code: `// @ts-expect-error\nconst p: UserPatch = { name: 5 };\nvoid p;`, cat: 'edge' },
      { label: 'applyPatch returns a User', code: `const u: User = applyPatch({ id: 1, name: 'Ada', email: 'a@example.com' }, { name: 'Grace' });\nvoid u;`, cat: 'basic' },
    ],
    tests: [],
    traceArgs: [],
    track: [],
    variants: [
      v(
        'patch-partial-only',
        'ts-too-loose',
        'A patch may contain the id',
        'Partial<User> makes every property optional, including id, so a patch that tries to change the id is accepted.',
        'Remove the id from User before making the rest optional.',
        ['Which utility type removes a property?', 'In which order should the two helpers be applied?'],
        `interface User {
  id: number;
  name: string;
  email: string;
}

type NewUser = Omit<User, 'id'>;
type UserPatch = Partial<User>;

function applyPatch(user: User, patch: UserPatch): User {
  return { ...user, ...patch };
}`,
      ),
      v(
        'patch-not-partial',
        'ts-missing-prop',
        'A patch must still contain everything',
        'Omit<User, "id"> removes the id but leaves name and email required, so a patch with only an email is rejected.',
        'Make the remaining properties optional too.',
        ['Which utility type makes properties optional?'],
        `interface User {
  id: number;
  name: string;
  email: string;
}

type NewUser = Omit<User, 'id'>;
type UserPatch = Omit<User, 'id'>;

function applyPatch(user: User, patch: UserPatch): User {
  return { ...user, ...patch };
}`,
      ),
      v(
        'newuser-optional',
        'ts-too-loose',
        'A NewUser is made of optional properties',
        'Partial<User> allows an id and lets name and email be left out, so the checks that expect rejections fail.',
        'A NewUser is a User with the id removed, nothing else changes.',
        ['Which helper removes one property and keeps the others required?'],
        `interface User {
  id: number;
  name: string;
  email: string;
}

type NewUser = Partial<User>;
type UserPatch = Partial<Omit<User, 'id'>>;

function applyPatch(user: User, patch: UserPatch): User {
  return { ...user, ...patch };
}`,
      ),
      v(
        'record-any',
        'ts-any',
        'The patch is a record of any',
        'Record<string, any> accepts every key and every value, so no mistake in a patch is ever reported.',
        'Build the patch from User with Omit and Partial.',
        ['Which keys may a patch contain?'],
        `interface User {
  id: number;
  name: string;
  email: string;
}

type NewUser = Omit<User, 'id'>;
type UserPatch = Record<string, any>;

function applyPatch(user: User, patch: UserPatch): User {
  return { ...user, ...patch };
}`,
      ),
    ],
  },
];
