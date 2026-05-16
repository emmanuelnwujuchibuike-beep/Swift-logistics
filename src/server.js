const express = require('express');
const cors = require('cors');
const { sendTrackingEmail } = require('./mailer');

const app = express();

// Middleware
        app.use(cors());
        app.use(express.json());

        app.post('/api/create-shipment', async (req, res) => {
        try {
            const { email, name } = req.body;
            
            // This triggers your mailer.js logic
            const trackingID = await sendTrackingEmail(email, name); 

            // CRITICAL: This line tells the frontend to stop "Processing"
            return res.status(200).json({ 
                success: true, 
                trackingID: trackingID 
            });

        } catch (err) {
            console.error("Server Error:", err.message);
            // If it fails, we must tell the frontend so it can show an error
            return res.status(500).json({ success: false, error: err.message });
        }
    });


    

// Make sure the port (5000) matches the one in server.js
const response = await fetch('http://localhost:5000/api/create-shipment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));