document.addEventListener("DOMContentLoaded", function () {
    const agreementModal = document.getElementById("agreementModal");
    const closeModal = document.querySelector(".close");
    const agreementLink = document.getElementById("agreementLink");
    const confirmAgreementBtn = document.getElementById("confirmAgreement");
    const agreeToTermsCheckbox = document.getElementById("agreeToTerms");
    const insuranceCheck = document.getElementById("insuranceCheck");
    const paiCheck = document.getElementById("paiCheck"); // Get PAI checkbox

    const totalPriceElement = document.getElementById("totalPrice");
    const renterName = document.getElementById("renterName");
    const carNameModal = document.getElementById("carNameModal");
    const priceModal = document.getElementById("priceModal"); // Ensure this exists in HTML
    const totalPriceModal = document.getElementById("totalPriceModal");
    const submitBtn = document.getElementById("submit-btn"); // Get the payment button

    let basePrice = 0; // Store the original price

    // ✅ Debugging: Check if elements exist
    console.log("📌 Debugging Elements:");
    console.log("agreementModal:", agreementModal);
    console.log("priceModal:", priceModal);
    console.log("totalPriceModal:", totalPriceModal);
    console.log("paiCheck:", paiCheck);
    console.log("submitBtn:", submitBtn);

    if (!agreementModal || !priceModal || !totalPriceModal || !submitBtn) {
        console.error("❌ One or more elements are missing in the HTML!");
        return;
    }

    // ✅ Fetch User Details
    function fetchUserDetails() {
        fetch("get_user.php")
            .then(response => response.json())
            .then(data => {
                renterName.innerText = data.name || "Unknown Renter";
            })
            .catch(error => {
                console.error("❌ Error fetching user details:", error);
                renterName.innerText = "Error loading user";
            });
    }

    // ✅ Function to fetch the correct price based on rental type
    // agreement.js
    function getBasePrice() {
        let rentalType = localStorage.getItem("rentalType");
        let selectedCar = JSON.parse(localStorage.getItem("selectedCar"));
        let storedTotalPrice = localStorage.getItem("totalPrice");

        console.log("rental type from local storage: ", rentalType);
        console.log("total price from local storage: ", storedTotalPrice);
        console.log("selected car object: ", selectedCar);

        if (!selectedCar) {
            console.error("❌ Missing car data in LocalStorage.");
            return 0;
        }

        if (!storedTotalPrice) {
            console.error("❌ Missing total price in LocalStorage.");
            return 0;
        }

        let price = parseFloat(storedTotalPrice);
        if (isNaN(price)) {
            console.error("❌ Invalid total price in LocalStorage.");
            return 0;
        }

        console.log(`📌 Extracted Base Price (${rentalType}): ₹${price}`);

        return price;
    }

    // Get and format the current date
    function getCurrentDate() {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = today.getFullYear();
        return `${day}/${month}/${year}`;
    }
    function updateAgreementDate() {
        const agreementDateElement = document.getElementById("agreementDate");
        if (agreementDateElement) {
            agreementDateElement.textContent = `${getCurrentDate()}`;
        }
    }
    // ✅ Show Agreement Modal
    if (agreementLink) {
        agreementLink.addEventListener("click", function (e) {
            e.preventDefault();
            agreementModal.style.display = "block";
            fetchUserDetails();

            // ✅ Fetch the correct base price and store it temporarily
            basePrice = getBasePrice();
            sessionStorage.setItem("originalBasePrice", basePrice);

            // ✅ Populate car name
            const selectedCar = JSON.parse(localStorage.getItem("selectedCar"));
            if (selectedCar) {
                carNameModal.innerText = selectedCar.name;
            } else {
                console.error("❌ selectedCar is missing in localStorage.");
            }

            // ✅ Fix: Ensure "Price:" is updated correctly (WITHOUT INSURANCE)
            priceModal.innerText = `₹${basePrice.toFixed(2)}`;
            totalPriceModal.innerText = `₹${basePrice.toFixed(2)}`;

            // ✅ Reset insurance checkbox
            insuranceCheck.checked = false;
            paiCheck.checked = false; // Reset PAI checkbox
            updateTotalPrice(); // Initial update to reflect no insurance selected
            updateAgreementDate();
        });
    }

    // ✅ Close Agreement Modal
    if (closeModal) {
        closeModal.addEventListener("click", function () {
            agreementModal.style.display = "none";
        });
    }

    // ✅ Enable Confirm button only when terms are accepted
    if (agreeToTermsCheckbox) {
        agreeToTermsCheckbox.addEventListener("change", function () {
            confirmAgreementBtn.disabled = !this.checked;
        });
    }

    // ✅ Update total price when insurance is checked
    function updateTotalPrice() {
        let originalPrice = parseFloat(sessionStorage.getItem("originalBasePrice"));
        if (isNaN(originalPrice)) {
            console.error("❌ Original base price is invalid!");
            originalPrice = 0;
        }
    
        let finalPrice = originalPrice;
        if (insuranceCheck.checked) {
            finalPrice += 100;
        }
        if (paiCheck.checked) {
            finalPrice += 100;
        }
        console.log(`📌 Updated Price: ₹${finalPrice}`);
    
        // ✅ Update UI correctly
        priceModal.innerText = `₹${originalPrice.toFixed(2)}`;
        totalPriceModal.innerText = `₹${finalPrice.toFixed(2)}`;
        totalPriceElement.innerText = `₹${finalPrice.toFixed(2)}`;
    }

    if (insuranceCheck) {
        insuranceCheck.addEventListener("change", updateTotalPrice);
    }

    if (paiCheck) {
        paiCheck.addEventListener("change", updateTotalPrice);
    }

    // ✅ Confirm & Proceed Button Click
    if (confirmAgreementBtn) {
        confirmAgreementBtn.addEventListener("click", function () {
            alert("✅ Booking confirmed! Proceeding with payment.");
            agreementModal.style.display = "none";
            submitBtn.disabled = false; // Enable the payment button
            localStorage.setItem("finalTotalPrice", totalPriceElement.innerText.replace('₹', ''));
            localStorage.setItem("basicCarInsurance", insuranceCheck.checked ? 'yes' : 'no');
            localStorage.setItem("personalAccidentInsurance", paiCheck.checked ? 'yes' : 'no');
        });
    }
});