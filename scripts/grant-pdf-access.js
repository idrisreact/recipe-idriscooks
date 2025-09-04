// Script to manually grant PDF access for successful payment
const fetch = require('node-fetch');

async function grantAccess() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/grant-pdf-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userEmail: 'your-email@example.com', // Replace with actual email
        paymentIntentId: 'pi_3S3i1bRqv4zbLiHS1Q1L2jxB'
      })
    });

    const result = await response.json();
    console.log('Grant access result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

grantAccess();