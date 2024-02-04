

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
const accountSid = 'XXXXXXXXXXXXXXXXXXXX';
const authToken = 'xxxxxxxxxxxxxxxxxx';
const twilioPhoneNumber = 'xxxxxxxxxxxxx'
const client = require('twilio')(accountSid, authToken);

async function sendSMS(message, to) {
    try {
        const response = await client.messages.create({
            body: message,
            to: to,
            from: twilioPhoneNumber,
        });
        console.log('SMS sent:', response.sid);
        return response;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw new Error('Failed to send SMS');
    }
}

module.exports =  sendSMS ;