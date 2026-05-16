const { sendTrackingEmail } = require('./mailer');

console.log("Starting email test...");

sendTrackingEmail("anthonialopez119@gmail.com", "John smith")
    .then(id => {
        console.log("✅ Success! Email sent with ID:", id);
    })
    .catch(err => {
        console.log("❌ Test failed. See error above.");
    });