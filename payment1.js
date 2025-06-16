// This file contains helper functions and event listener setup for payment.html

// Function to set default time values with a 1-hour delay for pickup
function setDefaultPickupTime() {
    const pickupTimeInput = document.getElementById("pickupTime");
    const rentalType = document.querySelector('input[name="rentalType"]:checked')?.value;
    const rentalDateInput = document.getElementById("rentalDate");

    if (!pickupTimeInput) return;

    const now = new Date();
    now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + (5.5 * 60)); // Convert to IST
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    if (rentalType === "perHour" && rentalDateInput?.value) {
        const selectedDate = new Date(rentalDateInput.value);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (selectedDate.getTime() === today.getTime()) {
            // Booking is for today: restrict pickupTime to now or later
            const minHour = currentHours;
            const minMin = currentMinutes;
            const formattedMin = `${String(minHour).padStart(2, '0')}:${String(minMin).padStart(2, '0')}`;
            pickupTimeInput.min = formattedMin;

            // Default to next hour rounded
            const nextHour = new Date(now);
            nextHour.setHours(now.getHours() + 1);
            nextHour.setMinutes(0);
            const defaultHour = String(nextHour.getHours()).padStart(2, '0');
            pickupTimeInput.value = `${defaultHour}:00`;
        } else {
            // Future date: no restriction
            pickupTimeInput.min = "";
            pickupTimeInput.value = "09:00";
        }
    } else {
        // Default fallback
        pickupTimeInput.value = "09:00";
    }
}


// Function to set default drop-off time based on pickup time + rental hours
function setDefaultDropoffTime() {
    const dropoffTimeInput = document.getElementById("dropoffTime");
    const pickupTimeInput = document.getElementById("pickupTime");
    const rentalHoursInput = document.getElementById("hours");
    
    // Enforce time range on drop-off input
    dropoffTimeInput.min = "06:00";
    dropoffTimeInput.max = "23:59";
    dropoffTimeInput.value = "11:00"; // optional default
    
    if (dropoffTimeInput && pickupTimeInput && pickupTimeInput.value) {
        const [pickupHours, pickupMinutes] = pickupTimeInput.value.split(':').map(Number);
        const pickupDate = new Date();
        pickupDate.setHours(pickupHours);
        pickupDate.setMinutes(pickupMinutes);
        
        // Use rental hours if provided, else default to 1 hour
        let rentalHours = 1;
        if (rentalHoursInput && rentalHoursInput.value) {
            rentalHours = parseInt(rentalHoursInput.value, 10) || 1;
        }
        
        const dropoffDate = new Date(pickupDate);
        dropoffDate.setHours(pickupDate.getHours() + rentalHours);
        
        const hours = String(dropoffDate.getHours()).padStart(2, '0');
        const minutes = String(dropoffDate.getMinutes()).padStart(2, '0');
        dropoffTimeInput.value = `${hours}:${minutes}`;
    } else if (dropoffTimeInput && !dropoffTimeInput.value) {
        const nowMumbai = new Date();
        nowMumbai.setMinutes(nowMumbai.getMinutes() + nowMumbai.getTimezoneOffset() + (5.5 * 60));
        nowMumbai.setHours(nowMumbai.getHours() + 2); // default to 2 hours from now if no pickup is set
        nowMumbai.setMinutes(0);
        nowMumbai.setSeconds(0);
        
        const hours = String(nowMumbai.getHours()).padStart(2, '0');
        const minutes = String(nowMumbai.getMinutes()).padStart(2, '0');
        dropoffTimeInput.value = `${hours}:${minutes}`;
    }
}

// Function to check if the selected time is in the past (for perHour bookings)
function isPastTime(dateInputId, timeInputId) {
    const rentalType = document.querySelector('input[name="rentalType"]:checked')?.value;
    if (rentalType === "perHour") {
        const dateInput = document.getElementById(dateInputId);
        const timeInput = document.getElementById(timeInputId);
        
        if (dateInput && timeInput && dateInput.value && timeInput.value) {
            const selectedDate = new Date(dateInput.value);
            const [hours, minutes] = timeInput.value.split(':').map(Number);
            selectedDate.setHours(hours);
            selectedDate.setMinutes(minutes);
            selectedDate.setSeconds(0);
            selectedDate.setMilliseconds(0);
            
            const nowMumbai = new Date();
            nowMumbai.setMinutes(nowMumbai.getMinutes() + nowMumbai.getTimezoneOffset() + (5.5 * 60));
            
            return selectedDate <= nowMumbai;
        }
    }
    return false;
}

// Function to set default date if empty
function setDefaultDate(elementId, dateValue) {
    const dateInput = document.getElementById(elementId);
    if (dateInput && !dateInput.value) {
        dateInput.valueAsDate = dateValue;
    }
}

// Function to format date for input attributes (YYYY-MM-DD)
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Function to set up location select listeners
function setupLocationSelectListeners() {
    const pickupLocationSelect = document.getElementById("pickupLocation");
    const pickupAddressInput = document.getElementById("pickupAddress");
    const dropoffLocationSelect = document.getElementById("dropoffLocation");
    const dropoffAddressInput = document.getElementById("dropoffAddress");
    
    if (pickupLocationSelect && pickupAddressInput) {
        pickupLocationSelect.addEventListener("change", function() {
            pickupAddressInput.style.display = this.value === "other" ? "block" : "none";
        });
    }
    
    if (dropoffLocationSelect && dropoffAddressInput) {
        dropoffLocationSelect.addEventListener("change", function() {
            dropoffAddressInput.style.display = this.value === "other" ? "block" : "none";
        });
    }
}

// Function to set date constraints and default dates
function setDateConstraintsAndDefaults() {
    const todayMumbai = new Date();
    todayMumbai.setMinutes(todayMumbai.getMinutes() + todayMumbai.getTimezoneOffset() + (5.5 * 60));
    const todayFormatted = formatDateForInput(todayMumbai);
    const twoMonthsLaterMumbai = new Date(todayMumbai);
    twoMonthsLaterMumbai.setMonth(todayMumbai.getMonth() + 2);
    const twoMonthsLaterFormatted = formatDateForInput(twoMonthsLaterMumbai);
    const nextMonthMumbai = new Date(todayMumbai);
    nextMonthMumbai.setMonth(todayMumbai.getMonth() + 2);
    const endOfNextMonthFormatted = formatDateForInput(new Date(nextMonthMumbai.getFullYear(), nextMonthMumbai.getMonth() + 1, 0));
    
    const pickupDateInput = document.getElementById("pickupDate");
    const dropoffDateInput = document.getElementById("dropoffDate");
    const rentalDateInput = document.getElementById("rentalDate");
    
    if (pickupDateInput) {
        pickupDateInput.setAttribute("min", todayFormatted);
        pickupDateInput.setAttribute("max", twoMonthsLaterFormatted);
        setDefaultDate("pickupDate", todayMumbai);
    }
    if (dropoffDateInput) {
        dropoffDateInput.setAttribute("min", todayFormatted);
        dropoffDateInput.setAttribute("max", twoMonthsLaterFormatted);
        setDefaultDate("dropoffDate", new Date(Date.now() + (24 * 60 * 60 * 1000))); // Default to tomorrow
    }
    if (rentalDateInput) {
        rentalDateInput.setAttribute("min", todayFormatted);
        rentalDateInput.setAttribute("max", endOfNextMonthFormatted);
        setDefaultDate("rentalDate", todayMumbai);
    }
}

// Helper function to check if a given time is within allowed range: 06:00 to 23:59
function isTimeInAllowedRange(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    const minMinutes = 6 * 60;      // 06:00 AM
    const maxMinutes = 23 * 60 + 59;  // 11:59 PM
    return totalMinutes >= minMinutes && totalMinutes <= maxMinutes;
}

// The core event listener setup for UI interactions
function setupEventListeners() {
    document.querySelectorAll('input[name="rentalType"]').forEach(radio => {
        radio.addEventListener("change", function () {
            const hourSelection = document.getElementById("hourSelection");
            const dateSelection = document.getElementById("dateSelection");
            const rentalDateInput = document.getElementById("rentalDate");
            const todayMumbai = new Date();
            todayMumbai.setMinutes(todayMumbai.getMinutes() + todayMumbai.getTimezoneOffset() + (5.5 * 60));
            setDefaultDate("rentalDate", todayMumbai);
            
            if (this.value === "perHour") {
                hourSelection.style.display = "block";
                dateSelection.style.display = "none";
                setDefaultPickupTime();
                setDefaultDropoffTime();
            } else {
                hourSelection.style.display = "none";
                dateSelection.style.display = "block";
            }
            updatePriceDisplay();
            localStorage.setItem("rentalType", this.value);
            document.getElementById("agreementLink").disabled = false;
        });
    });
    document.getElementById("hours")?.addEventListener("input", function () {
        setDefaultDropoffTime(); // ← recalculate dropoff
        updatePriceDisplay();    // ← update pricing
    });
    
    document.getElementById("pickupDate")?.addEventListener("change", updatePriceDisplay);
    document.getElementById("dropoffDate")?.addEventListener("change", updatePriceDisplay);
    
    document.getElementById("pickupTime")?.addEventListener("change", function() {
        // Validate time range for pickup
       
        if (isPastTime("rentalDate", "pickupTime")) {
            alert("❌ Pickup time cannot be in the past.");
            setDefaultPickupTime();
        }
        updatePriceDisplay();
        setDefaultDropoffTime(); // Auto-update drop-off time when pickup changes
    });
    
    document.getElementById("dropoffTime")?.addEventListener("change", function() {
        // Validate time range for drop-off
      
        if (isPastTime("rentalDate", "dropoffTime")) {
            alert("❌ Drop-off time cannot be in the past.");
            setDefaultDropoffTime();
        }
        updatePriceDisplay();
    });
}

setupEventListeners();
