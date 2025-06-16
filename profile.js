document.addEventListener("DOMContentLoaded", async function () {
    const userNameElement = document.getElementById("userName");
    const userEmailElement = document.getElementById("userEmail");
    const userPhoneElement = document.getElementById("userPhone");
    const perDayBookingsTableBody = document.getElementById("perDayBookingsTableBody");
    const perHourBookingsTableBody = document.getElementById("perHourBookingsTableBody");

    async function fetchUserData() {
        try {
            const userResponse = await fetch("http://localhost/car_rental/get_user.php");
            const userData = await userResponse.json();

            if (userData.error) {
                alert("Please log in first!");
                window.location.href = "login.html";
                return null;
            }

            userNameElement.innerText = userData.name;
            userEmailElement.innerText = userData.email;
            userPhoneElement.innerText = userData.phone;
            return userData;
        } catch (error) {
            console.error("Error fetching user data:", error);
            alert("Failed to load user data.");
            return null;
        }
    }

    async function fetchUpdatedBookings(email) {
        try {
            const updatedRes = await fetch(`http://localhost/car_rental/get_updated_bookings.php?email=${email}`);
            const responseText = await updatedRes.text();

            let updatedData;
            try {
                updatedData = JSON.parse(responseText);
            } catch (e) {
                console.error("Error parsing JSON:", e);
                console.log(responseText);
                return { per_day: [], per_hour: [] };
            }

            return updatedData;
        } catch (error) {
            console.error("Error fetching updated bookings:", error);
            return { per_day: [], per_hour: [] };
        }
    }

    async function fetchBookings(email) {
        try {
            const bookingsResponse = await fetch(`http://localhost/car_rental/get_bookings.php?email=${email}`);
            const bookingsData = await bookingsResponse.json();
            return bookingsData;
        } catch (error) {
            console.error("Error fetching bookings:", error);
            alert("Failed to load bookings.");
            return { perDay: [], perHour: [] };
        }
    }

    function populatePerDayBookingsTable(bookings) {
        perDayBookingsTableBody.innerHTML = "";

        if (bookings.length === 0) {
            perDayBookingsTableBody.innerHTML = '<tr><td colspan="8" class="no-bookings">No per day bookings found.</td></tr>';
        } else {
            bookings.forEach(booking => {
                const price = booking.updated_price ?? booking.price ?? "N/A";
                const carImage = booking.car_image || '';
                const imageUrl = carImage ? `http://localhost/car_rental/${carImage}` : '';

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>
                        ${carImage ? `<img src="${imageUrl}" alt="${booking.car_name}" style="width: 300px; height: auto; border-radius: 6px; margin-right: 10px;">` : ""}
                        <br><strong>${booking.car_name}</strong>
                    </td>
                    <td>${booking.car_name}</td>
                    <td>${booking.pickup_date}</td>
                    <td>${booking.dropoff_date}</td>
                    <td>${booking.pai_insurance}</td>
                    <td>${booking.basic_insurance}</td>
                    <td>₹${price}</td>
                    <td class="actions-buttons">
                        <button class="update-btn" 
                            data-id="${booking.id}" 
                            data-rental-type="perDay" 
                            data-updated="${booking.isUpdated}" 
                            ${booking.pai_insurance === "Yes" || booking.basic_insurance === "Yes" ? "disabled" : ""}>
                            Update
                        </button>
                        <button class="delete-btn" 
                            data-id="${booking.id}" 
                            data-rental-type="perDay" 
                            data-updated="${booking.isUpdated==true}">
                            Delete
                        </button>
                    </td>
                `;
                perDayBookingsTableBody.appendChild(row);
            });
        }
    }

    function populatePerHourBookingsTable(bookings) {
        perHourBookingsTableBody.innerHTML = "";

        if (bookings.length === 0) {
            perHourBookingsTableBody.innerHTML = '<tr><td colspan="9" class="no-bookings">No per hour bookings found.</td></tr>';
        } else {
            bookings.forEach(booking => {
                const price = booking.updated_price ?? booking.price ?? "N/A";
                const carImage = booking.car_image || '';
                const imageUrl = carImage ? `http://localhost/car_rental/${carImage}` : '';

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>
                        ${carImage ? `<img src="${imageUrl}" alt="${booking.car_name}" style="width: 300px; height: auto; border-radius: 6px; margin-right: 10px;">` : 'No image available'}
                        <br><strong>${booking.car_name}</strong>
                    </td>
                    <td>${booking.car_name}</td>
                    <td>${booking.rental_date}</td>
                    <td>${booking.hours}</td>
                    <td>${booking.pickup_time}</td>
                    <td>${booking.dropoff_time}</td>
                    <td>${booking.pai_insurance}</td>
                    <td>${booking.basic_insurance}</td>
                    <td>₹${price}</td>
                    <td class="actions-buttons">
                        <button class="update-btn" 
                            data-id="${booking.id}" 
                            data-rental-type="perHour" 
                            data-updated="${booking.isUpdated}" 
                            ${booking.pai_insurance === "Yes" || booking.basic_insurance === "Yes" ? "disabled" : ""}>
                            Update
                        </button>
                        <button class="delete-btn" 
                            data-id="${booking.id}" 
                            data-rental-type="perHour" 
                            data-updated="${booking.isUpdated==true}">
                            Delete
                        </button>
                    </td>
                `;
                perHourBookingsTableBody.appendChild(row);
            });
        }
    }

    async function deleteBooking(bookingId, rentalType, isUpdated = false) { // Added isUpdated
        try {
            const url = isUpdated
                ? "http://localhost/car_rental/delete_updated_booking.php"
                : "http://localhost/car_rental/delete_booking.php";

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }, body: JSON.stringify({ id: bookingId, rentalType, isUpdated })
                // Added isUpdated to body
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert("Booking deleted successfully!");
                await loadBookings(); // Re-load everything after deletion.  Consider removing and handling in JS
            } else {
                alert(`Failed to delete booking: ${data.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error deleting booking:", error);
            alert("Failed to delete booking.");
        }
    }



perDayBookingsTableBody.addEventListener('click', function (event) {
    if (event.target.classList.contains('delete-btn')) {
        const bookingId = event.target.dataset.id;
        const rentalType = event.target.dataset.rentalType;
        const isUpdated = event.target.dataset.updated === "true"; // Get isUpdated

        deleteBooking(bookingId, rentalType, isUpdated); // Pass isUpdated
    }
});

perHourBookingsTableBody.addEventListener('click', function (event) {
    if (event.target.classList.contains('delete-btn')) {
        const bookingId = event.target.dataset.id;
        const rentalType = event.target.dataset.rentalType;
        const isUpdated = event.target.dataset.updated === "true"; // Get isUpdated

        deleteBooking(bookingId, rentalType, isUpdated); // Pass isUpdated
    }
});


    async function loadBookings() {
        const userData = await fetchUserData();
        if (!userData) return;

        const [original, updated] = await Promise.all([
            fetchBookings(userData.email),
            fetchUpdatedBookings(userData.email)
        ]);

        // Merge per-day bookings
        const updatedPerDayMap = new Map(updated.per_day.map(b => [b.booking_id, b]));
        const finalPerDay = original.perDay.map(b => {
            const updated = updatedPerDayMap.get(b.id);
            return updated ? { ...updated, isUpdated: true } : { ...b, isUpdated: false };
        });
        


        // Merge per-hour bookings
        const updatedPerHourMap = new Map(updated.per_hour.map(b => [b.booking_id, b]));
        const finalPerHour = original.perHour.map(b => {
            const updated = updatedPerHourMap.get(b.id);
            return updated ? { ...updated, isUpdated: true } : { ...b, isUpdated: false };
        });
        

        populatePerDayBookingsTable(finalPerDay);
        populatePerHourBookingsTable(finalPerHour);
    }

    // Load on page ready
    await loadBookings();
});
