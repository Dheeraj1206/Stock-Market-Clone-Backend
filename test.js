const axios = require('axios');

async function testRegister() {
  try {
    const response = await axios.post('http://localhost:5000/auth/register', {
      name: 'Test User 1',
      email: 'test1@example.com',
      password: 'password123',
      phone: '1234567890'
    });
    console.log('Register response:', response.data);
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
  }
}

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5000/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login response:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
  }
}

async function runTests() {
  await testRegister();
  const token = await testLogin();
  console.log('JWT Token:', token);
}

runTests();