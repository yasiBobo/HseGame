const axios = require('axios');

// Function to generate a random numeric code
function generateRandomCode(length) {
  const characters = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Function to send SMS with a random code
const sendSms = async ({ messages = ['test msg'], recipients = ['0912xxxxxxx'] }) => {
  const url = "https://sms.magfa.com/api/http/sms/v2/send";
  const headers = {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  };

  // Credentials
  const username = "zarrin_79461";
  const password = "FBXKg2mMHCbCk4UF";
  const domain = "zarrinroya";

  // Generate random code
  const randomCode = generateRandomCode(5); // Adjust length as needed

  // Modify messages to include random code
  const messagesWithCode = messages.map(message => `${message}`);

  // JSON data payload
  const payloadJson = {
    senders: ['98300079461'],
    messages: messagesWithCode,
    recipients
  };

  try {
    // POST request with JSON data
    const response = await axios.post(url, payloadJson, {
      auth: {
        username: `${username}/${domain}`,
        password: password
      },
      headers: headers
    });
    console.log('JSON Data Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : error.message;
  }
};

// Export the sendSms function for use in other modules if needed
module.exports = sendSms;