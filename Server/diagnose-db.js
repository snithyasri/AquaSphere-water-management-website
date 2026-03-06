const dns = require('dns');

console.log('--- MONGODB DNS DIAGNOSTIC ---');
console.log('Attempting to find your database shard addresses...');

dns.resolveSrv('_mongodb._tcp.cluster0.vexfkfx.mongodb.net', (err, addresses) => {
    if (err) {
        console.error('❌ ERROR: Could not find shards via DNS.');
        console.error('Details:', err.code, err.message);
        console.log('\nThis confirms your network/DNS is blocking MongoDB SRV records.');
        process.exit(1);
    }

    console.log('✅ SUCCESS! Found shard addresses:');
    addresses.forEach((addr, i) => {
        console.log(`${i + 1}: ${addr.name}:${addr.port}`);
    });

    console.log('\n--- NEXT STEPS ---');
    console.log('Please copy the shard names above and paste them to the AI.');
});
