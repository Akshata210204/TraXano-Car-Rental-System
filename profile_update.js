console.log("🚀 profile_update.js loaded");

const INSURANCE_PRICES = {
    basic: 100,
    pai: 200
};

let currentBooking = null;

document.addEventListener("DOMContentLoaded", () => {
    const updateBox = document.getElementById("updateBox");
    const updateForm = document.getElementById("updateForm");
    const saveUpdateBtn = document.getElementById("saveUpdateBtn");
    const cancelUpdateBtn = document.getElementById("cancelUpdateBtn");

    // When any update button is clicked on a booking row…
    document.body.addEventListener("click", async (event) => {
        if (event.target.classList.contains("update-btn")) {
            const bookingId = event.target.dataset.id;
            const rentalType = event.target.dataset.rentalType;

            try {
                const response = await fetch(`http://localhost/car_rental/get_bookings.php?booking_id=${bookingId}&rental_type=${rentalType}`);
                const booking = await response.json();
                console.log("Booking received:", booking);
                console.log("✅ booking.price check →", booking.price, booking.original_price, booking.updated_price);

                if (booking.error) {
                    alert("USER IS ALLOWED TO UPDATE ONLY ONCE!");
                    return;
                }

                const basicInsTaken = booking.basic_insurance?.trim().toLowerCase() === "yes";
                const paiInsTaken = booking.pai_insurance?.trim().toLowerCase() === "yes";

                currentBooking = booking;
                currentBooking.car_price = parseInt(booking.car_price || 0);
                console.log("✅ Current booking price:", currentBooking.car_price);
                currentBooking.original_price = parseFloat(booking.original_price || 0);

                // Build the update form HTML based on rental type:
                let formHTML = "";
                if (rentalType === "perDay") {
                    formHTML = `
                        <label>Pickup Date: <input type="date" id="pickup_date" value="${booking.pickup_date}"></label><br>
                        <label>Drop-off Date: <input type="date" id="dropoff_date" value="${booking.dropoff_date}"></label><br>
                        <label>Pickup Address: <input type="text" id="pickup_address" value="${booking.pickup_address}"></label><br>
                        <label>Drop-off Address: <input type="text" id="dropoff_address" value="${booking.dropoff_address}"></label><br>
                        <label>Basic Insurance: 
                            <select id="basic_insurance">
                                <option value="Yes" ${basicInsTaken ? "selected" : ""}>Yes</option>
                                <option value="No" ${!basicInsTaken ? "selected" : ""}>No</option>
                            </select>
                            ${basicInsTaken ? '<small style="color:green;">(Already taken, can’t change)</small>' : ''}
                        </label><br>
                        <label>PAI Insurance: 
                            <select id="pai_insurance">
                                <option value="Yes" ${paiInsTaken ? "selected" : ""}>Yes</option>
                                <option value="No" ${!paiInsTaken ? "selected" : ""}>No</option>
                            </select>
                            ${paiInsTaken ? '<small style="color:gray;">(Already taken, can’t change)</small>' : ''}
                        </label><br>
                    `;
                } else { // perHour booking
                    formHTML = `
                        <label>Date: <input type="date" id="rental_date" value="${booking.rental_date}"></label><br>
                        <label>Total Hours: <input type="number" id="hours" value="${booking.hours}"></label><br>
                        <label>Pickup Time: <input type="time" id="pickup_time" value="${booking.pickup_time}"></label><br>
                        <label>Drop-off Time: <input type="time" id="dropoff_time" value="${booking.dropoff_time}"></label><br>
                        <label>Pickup Address: <input type="text" id="pickup_address" value="${booking.pickup_address}"></label><br>
                        <label>Drop-off Address: <input type="text" id="dropoff_address" value="${booking.dropoff_address}"></label><br>
                        <label>Basic Insurance: 
                            <select id="basic_insurance">
                                <option value="Yes" ${basicInsTaken ? "selected" : ""}>Yes</option>
                                <option value="No" ${!basicInsTaken ? "selected" : ""}>No</option>
                            </select>
                            ${basicInsTaken ? '<small style="color:gray;">(Already taken, can’t change)</small>' : ''}
                        </label><br>
                        <label>PAI Insurance: 
                            <select id="pai_insurance">
                                <option value="Yes" ${paiInsTaken ? "selected" : ""}>Yes</option>
                                <option value="No" ${!paiInsTaken ? "selected" : ""}>No</option>
                            </select>
                            ${paiInsTaken ? '<small style="color:gray;">(Already taken, can’t change)</small>' : ''}
                        </label><br>
                    `;
                }

                updateForm.innerHTML = formHTML + `
                    <div id="newPriceSection" style="display:none; margin-top:10px;">
                        <p></p>
                        <div style="display:none;"><span id="updatedPrice"></span></div>
                        <button id="makePaymentBtn">Confirm Update</button>
                    </div>
                `;
                
                updateBox.style.display = "block";
                updateForm.dataset.id = bookingId;
                updateForm.dataset.rentalType = rentalType;

                // Set date constraints (no past date and max 2 months from today)
                setDateConstraints();
                // For perDay booking, dynamically update drop-off date minimum based on pickup date
                if (rentalType === "perDay") attachDateDependency();

                setTimeout(() => {
                    calculateUpdatedPrice();
                    attachInputListeners();
                    setupPaymentHandler();

                    // Disable insurance dropdowns if already taken
                    if (basicInsTaken) {
                        document.getElementById("basic_insurance").disabled = true;
                    }
                    if (paiInsTaken) {
                        document.getElementById("pai_insurance").disabled = true;
                    }
                }, 300);

            } catch (err) {
                console.error("Failed to fetch booking details:", err);
                alert("Error loading booking for update.");
            }
        }
    });

    let latestUpdatedPrice = 0; // Global variable to store latest calculated price
    let newPrice = 0; // Global variable to store new price

    // Set date constraints for inputs: no past date and a max of 2 months from today
    function setDateConstraints() {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const todayStr = `${yyyy}-${mm}-${dd}`;

        const twoMonthsLater = new Date();
        twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);
        const dd2 = String(twoMonthsLater.getDate()).padStart(2, '0');
        const mm2 = String(twoMonthsLater.getMonth() + 1).padStart(2, '0');
        const yyyy2 = twoMonthsLater.getFullYear();
        const maxStr = `${yyyy2}-${mm2}-${dd2}`;

        // List of date inputs in the update form
        const pickupDate = document.getElementById("pickup_date");
        const dropoffDate = document.getElementById("dropoff_date");
        const rentalDate = document.getElementById("rental_date");

        if (pickupDate) {
            pickupDate.setAttribute("min", todayStr);
            pickupDate.setAttribute("max", maxStr);
        }
        if (dropoffDate) {
            dropoffDate.setAttribute("min", todayStr);
            dropoffDate.setAttribute("max", maxStr);
        }
        if (rentalDate) {
            rentalDate.setAttribute("min", todayStr);
            rentalDate.setAttribute("max", maxStr);
        }
    }

    // For perDay bookings, make drop-off date depend on pickup date
    function attachDateDependency() {
        const pickupDateEl = document.getElementById("pickup_date");
        const dropoffDateEl = document.getElementById("dropoff_date");
        if (pickupDateEl && dropoffDateEl) {
            pickupDateEl.addEventListener("change", () => {
                // When pickup date changes, update drop-off minimum
                dropoffDateEl.setAttribute("min", pickupDateEl.value);
                // If drop-off date is before pickup date, adjust it
                if (new Date(dropoffDateEl.value) < new Date(pickupDateEl.value)) {
                    dropoffDateEl.value = pickupDateEl.value;
                }
                calculateUpdatedPrice();
            });
            dropoffDateEl.addEventListener("change", () => {
                calculateUpdatedPrice();
            });
        }
    }

    // Calculate updated price based on input values and insurance options
    function calculateUpdatedPrice() {
        newPrice = 0;
        const type = updateForm.dataset.rentalType;
        const basicInsurance = document.getElementById("basic_insurance")?.value || "No";
        const paiInsurance = document.getElementById("pai_insurance")?.value || "No";
        let carPrice = currentBooking.car_price || 0;
        console.log("Using car price:", carPrice);

        if (type === 'perDay') {
            const pickupDateEl = document.getElementById("pickup_date");
            const dropoffDateEl = document.getElementById("dropoff_date");
            if (!pickupDateEl || !dropoffDateEl) {
                console.error("Date fields missing for perDay rental.");
                return 0;
            }
            const start = new Date(pickupDateEl.value);
            const end = new Date(dropoffDateEl.value);
            // Calculate total days (ensure at least one day)
            const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
            newPrice = days * carPrice;
        } else if (type === 'perHour') {
            const hoursEl = document.getElementById("hours");
            if (!hoursEl) {
                console.error("Hours field missing for perHour rental.");
                return 0;
            }
            const hours = parseFloat(hoursEl.value);
            if (isNaN(hours) || hours <= 0) {
                console.error("Invalid hours input.");
                return 0;
            }
            const hourlyRate = Math.round(carPrice / 24);
            newPrice = hours * hourlyRate;
        }

        // Add insurance charges if applicable
        if (basicInsurance === "Yes") newPrice += INSURANCE_PRICES.basic;
        if (paiInsurance === "Yes") newPrice += INSURANCE_PRICES.pai;

        const originalPrice = currentBooking.original_price;
        const messageEl = document.querySelector("#newPriceSection p");
        let message = "";
        let payableAmount = 0;

        if (newPrice < originalPrice) {
            const refund = originalPrice - newPrice;
            const refundAfterCut = Math.round(refund * 0.9);
            message = `🟢 New price ₹${newPrice}. Original was ₹${originalPrice}. You'll be refunded ₹${refundAfterCut} (10% cut applied).`;
        } else if (newPrice > originalPrice) {
            const diff = newPrice - originalPrice;
            const modificationCharge = 100; // Flat ₹100 charge for modification
            payableAmount = diff + modificationCharge;
            message = `🟡 New price ₹${newPrice}. Original was ₹${originalPrice}. Modification charge: ₹${modificationCharge}. Please pay ₹${payableAmount}.`;
        } else {
            message = `🟠 New price is same as original (₹${originalPrice}). No extra charge.`;
        }

        document.getElementById("updatedPrice").textContent = `₹${newPrice}`;
        messageEl.innerHTML = message;
        document.getElementById("newPriceSection").style.display = "block";

        latestUpdatedPrice = newPrice;
        return newPrice;
    }

    // Attach listeners to inputs so that any change recalculates the updated price
    function attachInputListeners() {
        const inputs = updateForm.querySelectorAll("input, select");
        inputs.forEach(input => {
            if (updateForm.dataset.rentalType === "perHour") {
                const rentalDateEl = document.getElementById("rental_date");
                const pickupTimeEl = document.getElementById("pickup_time");
                const dropoffTimeEl = document.getElementById("dropoff_time");
                const hoursEl = document.getElementById("hours");
            
                function validatePickupTime() {
                    const rentalDate = new Date(rentalDateEl.value);
                    const now = new Date();
                    const [hh, mm] = (pickupTimeEl.value || "00:00").split(":").map(Number);
            
                    rentalDate.setHours(hh);
                    rentalDate.setMinutes(mm);
            
                    if (rentalDateEl.value === now.toISOString().slice(0, 10)) {
                        if (rentalDate < now) {
                            pickupTimeEl.setCustomValidity("Pickup time cannot be in the past.");
                            pickupTimeEl.reportValidity();
                            return false;
                        } else {
                            pickupTimeEl.setCustomValidity("");
                        }
                    } else {
                        pickupTimeEl.setCustomValidity("");
                    }
                    return true;
                }
            
    function updateDropoffTime() {
        const hours = parseInt(hoursEl.value);
        const pickup = pickupTimeEl.value;

        if (!pickup || isNaN(hours) || hours <= 0) return;

        const [h, m] = pickup.split(":").map(Number);
        const drop = new Date();
        drop.setHours(h, m);
        drop.setHours(drop.getHours() + hours);

        const formatted = drop.toTimeString().slice(0, 5); // HH:MM
        dropoffTimeEl.value = formatted;
    }

    pickupTimeEl.addEventListener("change", updateDropoffTime);
    hoursEl.addEventListener("change", updateDropoffTime);

                
            
                pickupTimeEl.addEventListener("change", () => {
                    if (validatePickupTime()) {
                        updateDropoffTime();
                        calculateUpdatedPrice();
                    }
                });
            
                hoursEl.addEventListener("change", () => {
                    updateDropoffTime();
                    calculateUpdatedPrice();
                });
            
                rentalDateEl.addEventListener("change", () => {
                    validatePickupTime();
                    calculateUpdatedPrice();
                });
            }
            
            input.addEventListener("change", () => {
                calculateUpdatedPrice();
            });
        });
    }

    console.log("💰 Updated price:", latestUpdatedPrice);

    // Setup the payment handler to send update information including new validations
    function setupPaymentHandler() {
        const makePaymentBtn = document.getElementById("makePaymentBtn");
        if (!makePaymentBtn || !updateForm) {
            console.error("❌ Make Payment button or update form not found.");
            return;
        }
        makePaymentBtn.addEventListener("click", () => {
            const rentalType = updateForm.dataset.rentalType;
            const bookingId = updateForm.dataset.id;
            if (!rentalType || !bookingId) {
                alert("⚠️ Missing booking information.");
                return;
            }
            let errorMsg = "";

            if (rentalType === "perHour") {
                const rentalDate = document.getElementById("rental_date").value;
                const pickupTime = document.getElementById("pickup_time").value;
                const hours = parseInt(document.getElementById("hours").value);
    
                if (!rentalDate || !pickupTime || isNaN(hours) || hours <= 0) {
                    errorMsg = "❌ All fields (date, time, hours) must be filled correctly.";
                } else {
                    const now = new Date();
                    const selectedDateTime = new Date(`${rentalDate}T${pickupTime}`);
                    const todayStr = now.toISOString().split("T")[0];
    
                    if (rentalDate < todayStr) {
                        errorMsg = "❌ Rental date cannot be in the past.";
                    } else if (rentalDate === todayStr && selectedDateTime < now) {
                        errorMsg = "❌ Pickup time cannot be in the past.";
                    }
                }
            } else if (rentalType === "perDay") {
                const pickupDate = document.getElementById("pickup_date").value;
                const dropoffDate = document.getElementById("dropoff_date").value;
                const todayStr = new Date().toISOString().split("T")[0];
    
                if (!pickupDate || !dropoffDate || pickupDate < todayStr) {
                    errorMsg = "❌ Pickup/Dropoff dates are invalid or in the past.";
                } else if (dropoffDate < pickupDate) {
                    errorMsg = "❌ Dropoff date must be after pickup date.";
                }
            }
    
            if (errorMsg) {
                alert(errorMsg);
                return;
            }
            // Build the form data. Note that for perDay bookings there are no time values.
            const formData = {
                booking_id: bookingId,
                rental_type: rentalType,
                pickup_date: document.getElementById("pickup_date")?.value || null,
                dropoff_date: document.getElementById("dropoff_date")?.value || null,
                // For perHour bookings, use 'rental_date', 'pickup_time', and 'dropoff_time'
                rental_date: document.getElementById("rental_date")?.value || null,
                pickup_time: rentalType === "perHour" ? document.getElementById("pickup_time")?.value || null : null,
                dropoff_time: rentalType === "perHour" ? document.getElementById("dropoff_time")?.value || null : null,
                hours: document.getElementById("hours")?.value || null,
                pickup_address: document.getElementById("pickup_address")?.value?.trim() || "",
                dropoff_address: document.getElementById("dropoff_address")?.value?.trim() || "",
                basic_insurance: document.getElementById("basic_insurance")?.value || "No",
                pai_insurance: document.getElementById("pai_insurance")?.value || "No",
                updated_price: latestUpdatedPrice || 0,
                payment_due: calculateUpdatedPrice(),
                email: currentBooking?.user_email || "",
                car_image: currentBooking?.booked_car || "",
                car_name: currentBooking?.car_name || ""
            };
            if (rentalType === "perDay") {
                const pickupDate = new Date(formData.pickup_date);
                const dropoffDate = new Date(formData.dropoff_date);
                if (!formData.pickup_date || !formData.dropoff_date || dropoffDate <= pickupDate) {
                    alert("⚠️ Dropoff date must be after pickup date.");
                    return;
                }
            } else if (rentalType === "perHour") {
                const now = new Date();
                const rentalDate = formData.rental_date;
                const pickupTime = convertTo24Hour(formData.pickup_time);
                const fullPickupDateTime = new Date(`${rentalDate}T${pickupTime}`);
            
                if (!formData.pickup_time || fullPickupDateTime < now) {
                    alert("⚠️ Pickup time must be in the future.");
                    return;
                }
            }
            console.log("📤 Sending update data:", formData);

            fetch("save_updated_booking.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            .then(async res => {
                const rawText = await res.text();
                console.log("📥 Raw response from server:", rawText);
                try {
                    const json = JSON.parse(rawText);
                    if (json.success) {
                        alert(json.message || "✅ Booking updated successfully!");
                        updateBox.style.display = "none";
                        updateForm.innerHTML = "";
                        window.location.reload();
                    } else {
                        alert("❌ Booking update failed: " + (json.message || "Unknown error."));
                    }
                } catch (e) {
                    console.error("❌ JSON parse error:", e);
                    alert("⚠️ Server returned an unexpected response. Check console.");
                }
            })
            .catch(err => {
                console.error("❌ Fetch error:", err);
                alert("❌ Could not connect to the update service.");
            });
        });
    }

    cancelUpdateBtn.addEventListener("click", () => {
        updateBox.style.display = "none";
        updateForm.innerHTML = "";
    });
});
function convertTo24Hour(time12h) {
    if (!time12h) return "00:00";
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
}
