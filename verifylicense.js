const xlsx = require("xlsx");

const workbook = xlsx.readFile("licenses.xlsx");
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

// Case-insensitive and trimmed header check
function verifyLicense(licenseNumber) {
    return data.some(row => {
        const key = Object.keys(row).find(k => k.trim().toLowerCase() === "license number");
        return key && row[key] === licenseNumber;
    });
}

module.exports = verifyLicense;
