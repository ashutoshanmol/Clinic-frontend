import http from 'http';

const email = 'admin@medicare.com';

const makeRequest = (path, postData) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
};

async function testFlow() {
  console.log('--- TESTING FORGOT PASSWORD FLOW ---');
  
  // Step 1: Request OTP
  console.log('\n1. Requesting OTP for:', email);
  const step1 = await makeRequest('/api/public/forgot-password', JSON.stringify({ email }));
  console.log('Status:', step1.status);
  console.log('Response:', step1.data);
  
  if (step1.status !== 200) {
    console.log('Failed at Step 1. Test aborted.');
    return;
  }
  
  console.log('\n--- Test complete. Step 2 & 3 require the actual OTP which was sent via email/console! ---');
}

testFlow().catch(console.error);
