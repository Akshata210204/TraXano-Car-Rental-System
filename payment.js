// This file contains the core logic for the payment page.

document.addEventListener("DOMContentLoaded", async function () {
    console.log("✅ payment.js loaded successfully");

    const totalPriceElement = document.getElementById("totalPrice");
    totalPriceElement.innerText = "₹0.00";

    // Fetch User Data
    try {
        const response = await fetch("http://localhost/car_rental/get_user.php");
        const user = await response.json();
        if (user.error) {
            alert("Please log in first!");
            window.location.href = "login.html";
            return;
        }
        document.getElementById("userName").innerText = user.name;
        document.getElementById("userEmail").innerText = user.email;
        document.getElementById("userPhone").innerText = user.phone;
    } catch (error) {
        alert("❌ Error loading user data");
        console.error("❌ Fetch user error:", error);
        return;
    }

    const selectedCar = getSelectedCar();
    if (!selectedCar) return;
    displayCarDetails(selectedCar);

    displayInsuranceMessage();
    setupLocationSelectListeners();
    setDateConstraintsAndDefaults();
    setDefaultPickupTime();
    setDefaultDropoffTime();
    setupEventListeners();// ✅ UI time restriction
    updatePriceDisplay();
});


function getSelectedCar() {
    const selectedCarData = localStorage.getItem("selectedCar");
    if (!selectedCarData) {
        alert("❌ No car selected! Redirecting...");
        window.location.href = "cars.html";
        return null;
    }
    try {
        const selectedCar = JSON.parse(selectedCarData);
        if (!selectedCar || !selectedCar.image || !selectedCar.name || !selectedCar.price) {
            throw new Error("Invalid car object structure");
        }
        return selectedCar;
    } catch (error) {
        console.error("🚨 Error parsing selectedCar from LocalStorage:", error);
        alert("❌ Invalid car data! Please select a car again.");
        localStorage.removeItem("selectedCar");
        window.location.href = "cars.html";
        return null;
    }
}

function displayCarDetails(car) {
    const carImageElement = document.getElementById("carImage");
    if (carImageElement) {
        carImageElement.src = `http://localhost/car_rental/${car.image}`;
        carImageElement.alt = car.name;
        console.log("🚗 Fixed Car Image Path:", carImageElement.src);
    } else {
        console.error("❌ Car image element not found in DOM!");
    }
    document.getElementById("carName").innerText = car.name;
    document.getElementById("carPrice").innerText = `₹${car.price}/day`;
}

function displayInsuranceMessage() {
    let insuranceSelected = localStorage.getItem("insuranceSelected") === "yes";
    const insuranceMessage = document.getElementById("insuranceMessage");
    insuranceMessage.innerText = insuranceSelected ? "✔ Insurance added (+₹100)" : "";
}



function calculatePrice() {
    const rentalType = document.querySelector('input[name="rentalType"]:checked')?.value;
    if (!rentalType) return 0;

    const selectedCarData = localStorage.getItem("selectedCar");
    if (!selectedCarData) return 0;

    try {
        const selectedCar = JSON.parse(selectedCarData);
        if (!selectedCar || !selectedCar.price) throw new Error("Car data is missing");

        const dailyPrice = parseFloat(selectedCar.price);
        let totalPrice = 0;

        if (rentalType === "perHour") {
            const rentalDate = document.getElementById("rentalDate")?.value;
            const pickupTime = document.getElementById("pickupTime")?.value;
            const dropoffTime = document.getElementById("dropoffTime")?.value;
            const hours = parseInt(document.getElementById("hours")?.value || 0);

            if (!rentalDate || !pickupTime || !dropoffTime || !hours) return 0;

            const pickupDateTime = new Date(`${rentalDate}T${pickupTime}`);
            const dropoffDateTime = new Date(`${rentalDate}T${dropoffTime}`);

            if (dropoffDateTime <= pickupDateTime) {
                alert("Drop-off time must be later than pickup time.");
                return 0;
            }

            totalPrice = hours * (dailyPrice / 24);
        }

        if (rentalType === "perDay") {
            const pickupDateStr = document.getElementById("pickupDate")?.value;
            const dropoffDateStr = document.getElementById("dropoffDate")?.value;

            if (!pickupDateStr || !dropoffDateStr) return 0;

            const pickupDate = new Date(pickupDateStr);
            const dropoffDate = new Date(dropoffDateStr);
            dropoffDate.setHours(23, 59, 59, 999); // Include full day

            if (pickupDate > dropoffDate) {
                alert("Drop-off date must be later than pickup date.");
                return 0;
            }

            const diffTime = dropoffDate.getTime() - pickupDate.getTime();
            const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            totalPrice = days * dailyPrice;
        }

        // Insurance addition
        const insuranceSelected = localStorage.getItem("insuranceSelected") === "yes";
        if (insuranceSelected) totalPrice += 100;

        return parseFloat(totalPrice.toFixed(2));

    } catch (err) {
        console.error("Error in price calculation:", err);
        return 0;
    }
}


function updatePriceDisplay() {
    const price = calculatePrice();
    document.getElementById("totalPrice").innerText = `₹${price.toFixed(2)}`;
    localStorage.setItem("totalPrice", price);
    return price;
}

function isValidTimeDifferenceWithDate(rentalDateStr, pickupTimeStr, dropoffTimeStr) {
    const rentalDate = new Date(rentalDateStr);
    const [pickupHours, pickupMinutes] = pickupTimeStr.split(":").map(Number);
    const [dropoffHours, dropoffMinutes] = dropoffTimeStr.split(":").map(Number);

    const pickupDateTime = new Date(rentalDate);
    pickupDateTime.setHours(pickupHours, pickupMinutes, 0, 0);

    const dropoffDateTime = new Date(rentalDate);
    dropoffDateTime.setHours(dropoffHours, dropoffMinutes, 0, 0);

    return dropoffDateTime > pickupDateTime;
}


document.getElementById("submit-btn").addEventListener("click", async function () {
    const finalPriceFromStorage = localStorage.getItem("finalTotalPrice");
    let price = parseFloat(finalPriceFromStorage);

    if (isNaN(price) || price <= 0) {
        alert("❌ Please enter valid rental details or confirm the agreement.");
        return;
    }

    const pickupTime = document.getElementById("pickupTime").value;
    const dropoffTime = document.getElementById("dropoffTime").value;

 

    if (isPastTime("rentalDate", "pickupTime")) {
        alert("❌ Pickup time cannot be in the past. Please select a valid time.");
        return;
    }

    if (isPastTime("rentalDate", "dropoffTime")) {
        alert("❌ Drop-off time cannot be in the past. Please select a valid time.");
        return;
    }

    const rentalType = document.querySelector('input[name="rentalType"]:checked').value;

    if (rentalType === "perHour") {
        const rentalDate = document.getElementById("rentalDate")?.value;
        const hoursSelected = parseInt(document.getElementById("hours").value) || 0;
    
        if (!isValidTimeDifferenceWithDate(rentalDate, pickupTime, dropoffTime)) {
            alert("❌ Drop-off time must be later than pickup time.");
            return;
        }
    
        // Strict match check
        const pickupDateTime = new Date(`${rentalDate}T${pickupTime}`);
        const dropoffDateTime = new Date(`${rentalDate}T${dropoffTime}`);
        const diffMs = dropoffDateTime - pickupDateTime;
        const diffHours = diffMs / (1000 * 60 * 60);
    
        if (Math.abs(diffHours - hoursSelected) > 0.01) {
            alert(`❌ Drop-off time must be exactly ${hoursSelected} hour(s) after pickup time.`);
            return;
        }
    
    

    }

    const selectedCar = JSON.parse(localStorage.getItem("selectedCar"));
    const bookingData = {
        userName: document.getElementById("userName").innerText,
        userEmail: document.getElementById("userEmail").innerText,
        carName: document.getElementById("carName").innerText,
        carImage: selectedCar.image,
        rentalType: rentalType,
        price: price,
        pickupAddress: document.getElementById("pickupLocation").value === "other"
            ? document.getElementById("pickupAddress").value
            : "Company",
        dropoffAddress: document.getElementById("dropoffLocation").value === "other"
            ? document.getElementById("dropoffAddress").value
            : "Company",
        pickupTime: pickupTime,
        dropoffTime: dropoffTime,
        basic_insurance: localStorage.getItem("basicCarInsurance") === 'yes' ? 'yes' : 'no',
        pai_insurance: localStorage.getItem("personalAccidentInsurance") === 'yes' ? 'yes' : 'no',
    };

    if (rentalType === "perHour") {
        bookingData.rentalDate = document.getElementById("rentalDate").value;
        bookingData.hours = parseInt(document.getElementById("hours").value) || 0;
    } else {
        bookingData.pickupDate = document.getElementById("pickupDate").value;
        bookingData.dropoffDate = document.getElementById("dropoffDate").value;
        bookingData.rentalDate = document.getElementById("pickupDate").value;
        bookingData.pickupTime = null;
        bookingData.dropoffTime = null;
    }

    try {
        const response = await fetch("http://localhost/car_rental/save_booking.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingData)
        });

        const text = await response.text();
        console.log("📦 Raw response from save_booking.php:", text);

        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            console.error("❌ Invalid JSON returned from PHP:", e);
            alert("Server returned invalid response");
            return;
        }

        if (result.success) {
            alert("✅ Payment Successful! Booking Confirmed.");
            localStorage.removeItem("selectedCar");
            localStorage.removeItem("finalTotalPrice");
            localStorage.removeItem("basicCarInsurance");
            localStorage.removeItem("personalAccidentInsurance");
            window.location.href = "confirmation.html";
        } else {
            alert("❌ Payment failed: " + (result.error || "Unknown error"));
        }
    } catch (error) {
        console.error("❌ Network Error:", error);
        alert("❌ Network error. Please try again.");
    }
});
