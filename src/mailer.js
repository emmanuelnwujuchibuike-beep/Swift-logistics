const nodemailer = require('nodemailer');

function generateTrackingID() {
    const prefix = "SFL-";
    const randomNumbers = Math.floor(100000000 + Math.random() * 900000000);
    return prefix + randomNumbers;
}

// MAKE SURE 'async' IS HERE
async function sendTrackingEmail(customerEmail, customerName) {
    const trackingID = generateTrackingID();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'swiftfreightlogix@gmail.com', // Your Gmail address
            pass: 'oicygmaalpdbfnlm' // PASTE THE CODE FROM STEP 1 HERE
        }
    });

        const mailOptions = {
    from: '"SwiftFreight Logistics" <swiftfreightlogix@gmail.com>',
    to: 'emmanuelnwujuchibuike@gmail.com', // Keeping your preferred address
    subject: `Important: Shipment Confirmation for ${customerName} (${trackingID})`,
    text: `Hello ${customerName}, your shipment is ready. Track it here: https://swiftfreightlogix.netlify.app/payment.html?id=${trackingID}`,
    html: `
    <div style="background-color: #020617; color: #ffffff; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: auto; border: 1px solid #1e293b; padding: 25px; border-radius: 12px; background-color: #0f172a;">
            <h1 style="color: #1E40AF; margin-bottom: 10px;">SwiftFreight Logistics</h1>
            <p style="font-size: 16px;">Dear <strong>${customerName}</strong>,</p>
            <p>Your logistics request has been processed. Below is your unique tracking identification number.</p>
            
            <div style="text-align: center; background-color: #020617; padding: 20px;">
            <img src="cid:swiftlogo" style="width: 120px;"/>
            <h1 style="color: #1E40AF;">SwiftFreight Logistics</h1>
            </div>

            <div style="background: #1e293b; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0; border: 1px dashed #334155;">
                <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Tracking ID</span><br>
                <strong style="font-size: 20px; color: #1E40AF; letter-spacing: 2px;">${trackingID}</strong>
            </div>

            <div style="text-align: center;">
                <a href="https://swiftfreightlogix.netlify.app/payment.html?id=${trackingID}" 
                   style="background-color: #1E40AF; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                   Track My Parcel
                </a>
            </div>

                <p style="margin-top: 30px; font-size: 14px; color: #94a3b8; text-align: center;">
                    SwiftFreight Logistics | California, Santa Monica, United States<br>

                    If you didn't expect this email, please ignore it.


                    Licensed International Freight & Logistics Operator  
                    Global Cargo Handling • Customs Clearance • Secure Shipment Processing  

                    Operating under international shipping and cargo compliance standards.  
                    All shipment records and tracking information are verified through our logistics network systems.

                    © 2025 SwiftFreightLogix. All rights reserved.
                </p>


                        
                    </div>
                </div>
                `
            };


            try {
                const info = await transporter.sendMail(mailOptions);
                // This tells you if Google actually accepted the email
                console.log("✅ Email accepted by Google server:", info.messageId); 
                return trackingID;
            } catch (error) {
                console.log("!!! REAL ERROR !!!:", error.message);
                throw error;
}

}

module.exports = { sendTrackingEmail };