import fetch from 'node-fetch';

const response = await fetch('http://localhost:4000/api/collect-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@clawlite.ai',
    source: 'api-test'
  })
});

const data = await response.json();
console.log('Status:', response.status);
console.log('Response:', data);
