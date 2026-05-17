const { sendTrackingEmail } = require('./mailer.js');


const customerEmail = "anthonialopez119@gmail.com"; 
const customerName = "Anthonia";

console.log("--- Starting Swift Freight Email Test ---");

// 2. Call the function and handle the result
sendTrackingEmail(customerEmail, customerName)
    .then((result) => {
    
        console.log("✅ Success! email sent to:", customerEmail);
        console.log("📦 Tracking ID Generated:", result);
    })
    .catch((err) => {
        console.error("❌ Test failed. See error details below:");
        console.error(err);
    });