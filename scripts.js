// registration.js

// Function to show the correct form (Register, Login, Guest)
function showForm(formId) {
    document.querySelectorAll(".form-box").forEach(box => {
        box.style.display = "none";
    });
    const form = document.getElementById(formId);
    if (form) {
        form.style.display = "block";
    } else {
        console.error(`Form with ID '${formId}' not found!`);
    }
}

// Make showForm accessible from HTML
window.showForm = showForm;

document.addEventListener("DOMContentLoaded", function () {
    // Get UI elements
    const sendPhoneOtpBtn = document.getElementById("send-phone-otp-btn");
    const verifyPhoneOtpBtn = document.getElementById("verify-phone-otp-btn");
    const sendEmailOtpBtn = document.getElementById("send-email-otp-btn");
    const verifyEmailOtpBtn = document.getElementById("verify-email-otp-btn");
    const verifyLicenseBtn = document.getElementById("verify-license-btn");
    const phoneOtpInput = document.getElementById("phoneOtp");
    const emailOtpInput = document.getElementById("emailOtp");
    const registerBtn = document.getElementById("register-btn");
    const licenseInput = document.getElementById("license_number");
    const licenseStatus = document.getElementById("license-status");
    const guestLoginBtn = document.getElementById("guestLoginBtn");

    // State variables
    let isLicenseVerified = false;
    let phoneOTP = null;
    let emailOTP = null;
    let phoneOTPVerified = false;
    let emailOTPVerified = false;

    // Generate a 4-digit OTP
    function generateOTP() {
        return Math.floor(1000 + Math.random() * 9000);
    }

    

    // Send OTP for phone/email
// Function to send OTP for phone or email
function sendOTP(type) {
    // ... (phone OTP logic remains the same if you're doing client-side phone OTP) ...
    if (type === "phone") {
        const phone = document.getElementById("phone").value.trim();

        if (!phone) {
            alert("Please enter your phone number.");
            return;
        }

        phoneOTP = generateOTP(); // 👈 Generate random 4-digit OTP
        alert(`📲 OTP sent to phone: ${phoneOTP}`);  // Simulated SMS
        console.log("Phone OTP:", phoneOTP);
    }

    if (type === "email") {
        const email = document.getElementById("email").value.trim();

        if (!email) {
            alert("Please enter your email.");
            return;
        }
        fetch("http://localhost:5000/send-email-otp", {
            method: "POST",
            credentials: "include",  // 👈 IMPORTANT
            headers: {
                "Content-Type": "application/json"
            },
         body: JSON.stringify({ email: email })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("OTP has been sent to your email.");
            } else {
                alert("Failed to send OTP: " + data.message);
            }
        })
        .catch(error => {
            console.error("Error sending email OTP:", error);
            alert("Error sending email OTP.");
        });
    }
}

function verifyOTP(type) {
    const enteredOTPInput = type === "phone" ? phoneOtpInput : emailOtpInput;
    const enteredOTP = enteredOTPInput.value.trim();

    if (type === "phone") {
        if (enteredOTP == phoneOTP) {
            phoneOTPVerified = true;
            enteredOTPInput.disabled = true;
            verifyPhoneOtpBtn.disabled = true;
            verifyPhoneOtpBtn.textContent = "✔ Verified";
            checkAllVerified();
        } else {
            alert("Incorrect Phone OTP. Please try again.");
        }
    }else if (type === "email") {
        // Send the entered email OTP to the Flask backend for verification
        fetch("http://localhost:5000/verify-email-otp", {
            method: "POST",
            credentials: "include",  // This lets browser send session cookies!
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ otp: enteredOTP })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                emailOTPVerified = true;
                enteredOTPInput.disabled = true;
                verifyEmailOtpBtn.disabled = true;
                verifyEmailOtpBtn.textContent = "✔ Verified";
                checkAllVerified();
            } else {
                alert("Incorrect Email OTP. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error verifying email OTP:", error);
            alert("Error verifying email OTP.");
        });
    }
}

function checkAllVerified() {
    if (phoneOTPVerified && emailOTPVerified && isLicenseVerified) {
        registerBtn.style.display = "block";
    }
}


    // Verify driving license
    async function verifyLicense() {
        const licenseNumber = licenseInput.value.trim();

        if (!licenseNumber) {
            alert("Please enter your license number.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/verify-license", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ licenseNumber })
            });

            const data = await response.json();

            if (response.ok) {
                isLicenseVerified = true;
                licenseStatus.textContent = "✔ License Verified!";
                licenseStatus.style.color = "green";
                verifyLicenseBtn.disabled = true;
                verifyLicenseBtn.textContent = "✔ Verified";
                checkAllVerified();
            } else {
                isLicenseVerified = false;
                licenseStatus.textContent = "❌ Invalid License Number!";
                licenseStatus.style.color = "red";
            }
        } catch (error) {
            console.error("Error verifying license:", error);
            licenseStatus.textContent = "❌ Server Error!";
            licenseStatus.style.color = "red";
        }
    }

    // Guest login function
    function guestLogin() {
        window.location.href = "cars.html";
    }

    // Register function
  // scripts.js
// ... (rest of your code)

registerBtn.addEventListener("click", async function (event) {
    event.preventDefault();

    if (!phoneOTPVerified || !emailOTPVerified || !isLicenseVerified) {
        alert("Please complete all verifications first.");
        return;
    }

    const formData = {
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value.trim(),
        licenseNumber: licenseInput.value.trim(),
        age: document.getElementById("age").value.trim(),
        phoneOtp: document.getElementById("phoneOtp").value.trim(), // Include phone OTP
        emailOtp: document.getElementById("emailOtp").value.trim()  // Include email OTP
    };
    if (parseInt(formData.age) < 23) {
        alert("You must be at least 23 years old to register.");
        return;
    }
    try {
        const response = await fetch("http://localhost/car_rental/register.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert(result.message + " Redirecting to login...");
            window.location.href = "login.html";
        } else {
            alert("Registration failed: " + (result.error || "An unexpected error occurred."));
        }
    } catch (error) {
        console.error("Registration error:", error);
        alert("Error during registration.");
    }
});

// ... (rest of your code)
    
    // Event listeners
    verifyLicenseBtn.addEventListener("click", verifyLicense);
    sendPhoneOtpBtn.addEventListener("click", () => sendOTP("phone"));
    verifyPhoneOtpBtn.addEventListener("click", () => verifyOTP("phone"));
    sendEmailOtpBtn.addEventListener("click", () => sendOTP("email"));
    verifyEmailOtpBtn.addEventListener("click", () => verifyOTP("email"));
    if (guestLoginBtn) {
        guestLoginBtn.addEventListener("click", guestLogin);
    }
});
