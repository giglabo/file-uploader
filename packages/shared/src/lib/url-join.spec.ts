import { urlJoin } from './url-join';

test('Test single 1', () => {
  const fullUrl = urlJoin('http://www.google.com', 'a', '/b/cd', '?foo=123');
  expect(fullUrl).toBe('http://www.google.com/a/b/cd?foo=123');
});

test('Test single 2', () => {
  const fullUrl = urlJoin('http://www.google.com/', '/a', '/b/cd/', '?foo=123');
  expect(fullUrl).toBe('http://www.google.com/a/b/cd?foo=123');
});

test('Test single 3', () => {
  const fullUrl = urlJoin('http://', 'www.google.com:45', 'a/b/cd/', '?foo=123');
  expect(fullUrl).toBe('http://www.google.com:45/a/b/cd?foo=123');
});
