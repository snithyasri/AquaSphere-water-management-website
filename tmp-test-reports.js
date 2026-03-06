const fetch = require('node-fetch');

async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/reports/all');
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Data:', data);
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

test();
