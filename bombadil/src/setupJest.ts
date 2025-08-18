import '@testing-library/jest-dom';

if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

process.env.REACT_APP_SUPABASE_ANON_KEY ??= 'mock-key';
process.env.REACT_APP_SUPABASE_URL ??= 'https://mock-url.supabase.co';

global.window ??= Object.create(window);
