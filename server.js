const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const xlsx = require("xlsx");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Load licenses from Excel file
const workbook = xlsx.readFile("licenses.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const licenses = xlsx.utils.sheet_to_json(sheet);

// License Verification Route
// server.js
// ... (rest of your code)

app.post("/verify-license", (req, res) => {
    const { licenseNumber } = req.body;

    console.log("Received data:", req.body);

    if (!licenseNumber) {
        return res.status(400).json({ error: "License number is required!" });
    }

    const trimmedLicenseNumber = licenseNumber.trim();
    const isValid = licenses.some(row => {
        const licenseKey = Object.keys(row).find(key => key.trim().toLowerCase() === "license number");
        const licenseInFile = licenseKey ? row[licenseKey].toString().trim() : '';
        return licenseInFile.toLowerCase() === trimmedLicenseNumber.toLowerCase();
    });

    if (isValid) {
        res.json({ success: true, message: "License verified successfully!" });
    } else {
        res.status(400).json({ success: false, message: "Invalid license number!" });
    }
});

// ... (rest of your code)

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
