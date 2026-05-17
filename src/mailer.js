const nodemailer = require('nodemailer');

function generateTrackingID() {
    const prefix = "SFL-";
    const randomNumbers = Math.floor(100000000 + Math.random() * 900000000);
    return prefix + randomNumbers;
}


async function sendTrackingEmail(customerEmail, customerName) {
    const trackingID = generateTrackingID();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'swiftfreightlogix@gmail.com',
            pass: 'rqzpcacnpqaolngg'
        }
    });

    const mailOptions = {
    from: '"SwiftFreight Logistics" <swiftfreightlogix@gmail.com>',
    to: customerEmail,
    subject: ` Update on Shipment ${customerName} (${trackingID})`,
    text: `Hello ${customerName}, your shipment is on the way.`,
    html: `
    <div style="background-color: #f3f4f6; color: #ffffff; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: auto; padding: 25px; border-radius: 12px; background-color: #f3f4f6;">

            <div style="text-align:; margin-bottom: 15px;">
                <img src="cid:mainlog.jpeg"  style="width: 140px; height: auto;">
            </div>
                <h1 style="color: #1E40AF; margin-bottom: 10px; font-weight: 800; text-transform: uppercase;">SwiftFreight Logistics</h1>
                <p style="font-size: 16px; color: #172554;">Dear <strong>${customerName}</strong>,</p>
                <p style="font-size: 16px;>We have a luggage here in our store room bearing your name.( Matias Gabriel Illanes )as the receiver and(Emily Wakeford) as the sender which was delivered and registered here for delivery on April 10th 2026 at 5pm and now is processed for delivery.</p>
                <p>Your logistics request has been CREATED and on the way. Below is your unique tracking number.</p>
            
            
            <a> Track it here: https://swiftfreightlogix.netlify.app/payment.html?id=${trackingID}</a>
            

            <div style="background: #1e293b; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0; border: 1px dashed #334155;">
                <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Tracking ID</span><br>
                <strong style="font-size: 20px; color: #FFC000; letter-spacing: 2px;">${trackingID}</strong>
            </div>

            <div style="text-align: center;">
                <a href="https://swiftfreightlogix.netlify.app/payment.html?id=${trackingID}" 
                   style="background-color: #1E40AF; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                   Track My Parcel
                </a>
            </div>

                <p style="margin-top: 30px; font-size: 14px; color: #94a3b8; text-align: center; line-height: 30px">
                    SwiftFreight Logistics LLC <br> 
                
                     Ignore This Message If You Didn't make the order.<br>


                    Licensed International Freight & Logistics Operator  
                    Global Cargo Handling • Customs Clearance • Secure Shipment Processing  

        
                    Licensed & Insured International Freight Services  
                </p>


                        
            </div>
        </div>
                
                        
    
                <div style="background-color: #f3f4f6; padding-top: 20px; line-height: 20px;"> 
                            <p style="padding-left: 15px; font-size: 14px; color: #707070;">
                                USDOT: 3487219 | MC: 1147826 | FMC Licensed  
                                Registered in the United States  

                                Head Office: 1201 Peachtree Street NE, Atlanta, GA 30361, USA  
                                Customer Support: support@swiftfreightlogistics.com  
                                Tracking Portal: www.swiftfreightlogix.com 
                            </p> 
                        </div>



                        <div style=">
                            <p style="font-size: 18px;"><i style="fab fa-twitter"></i></p>
                        </div>


                                    `,
                        attachments: [{
                            filename: 'mainlog.jpeg',
                            path: './image/mainlog.jpeg', 
                            cid: 'mainlog.jpeg'    
                        }]
                    };
                    
            // };

            

            try {
                const info = await transporter.sendMail(mailOptions);
            
                console.log("✅ Email accepted by Google server:", info.messageId); 
                return trackingID;
            } catch (error) {
                console.log("!!! REAL ERROR !!!:", error.message);
                throw error;
}

}

module.exports = { sendTrackingEmail };