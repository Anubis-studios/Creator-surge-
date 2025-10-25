import { greet } from '../src/index';

test('greet returns greeting', () => {
  expect(greet('World')).toBe('Hello, World!');
});
