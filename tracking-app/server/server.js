const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const trackingData = {
    "CHRIS105": {
        step1: "Loaded at Lagos Airport - 08:00 AM",
        step2: "Departed Lagos - 10:30 AM",
        step3: "On Transit to Port Harcourt",
        step4: "Expected: May 13, 2026",
        isDelivered: false
    }
};

app.get('/track/:id', (req, res) => {
    const code = req.params.id.toUpperCase();
    console.log("Checking for code:", code);

    if (trackingData[code]) {
        res.json(trackingData[code]);
    } else {
        res.status(404).json({ error: "Code not recognized" });
    }
});

// app.listen(3000, () => {
//     console.log("SERVER IS LIVE ON PORT 3000");
// });

// // This tells the server: Use the port Render gives us, or 3000 as a backup
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});