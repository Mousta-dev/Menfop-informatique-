const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3001/login', {
      username: 'Alpha',
      password: 'Mousta@2025'
    });
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin();
