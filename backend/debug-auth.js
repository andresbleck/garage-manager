const fetch = globalThis.fetch || require('node-fetch');

(async () => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        familyName: 'FamiliaDebug',
        displayName: 'Test User',
        email: 'testdebug@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }),
    });

    console.log('STATUS', response.status);
    const text = await response.text();
    console.log('BODY', text);
  } catch (error) {
    console.error('ERROR', error);
  }
})();
