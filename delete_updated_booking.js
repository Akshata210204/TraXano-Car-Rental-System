document.addEventListener("DOMContentLoaded", () => {
    const perDayTableBody = document.getElementById("perDayBookingsTableBody");
    const perHourTableBody = document.getElementById("perHourBookingsTableBody");

    async function deleteUpdatedBooking(bookingId, rentalType) {
        try {
            const response = await fetch("http://localhost/car_rental/delete_updated_booking.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: bookingId, rentalType: rentalType })
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                console.error("Server error deleting updated booking:", response.status, errorMessage);
                alert(`Failed to delete updated booking: Server error ${response.status}`);
                return;
            }

            const data = await response.json();

            if (data.success) {
                alert("Updated booking deleted successfully.");
                removeRowFromTable(bookingId, rentalType);
            } else {
                alert("Failed to delete updated booking: " + (data.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Error deleting updated booking:", error);
            alert("Error deleting updated booking.");
        }
    }

    function removeRowFromTable(bookingId, rentalType) {
        const tableBody = rentalType === "perHour" ? perHourTableBody : perDayTableBody;
        const rows = tableBody.querySelectorAll("tr");

        rows.forEach(row => {
            const deleteButton = row.querySelector(".delete-btn[data-id='" + bookingId + "'][data-updated='true']");
            if (deleteButton) {
                row.remove();
            }
        });
    }
    tableBody.addEventListener("click", async (event) => {
        const target = event.target;
        if (target.classList.contains("delete-btn")) {
            const bookingId = target.dataset.id;
            const rentalType = target.dataset.rentalType;
            const isUpdated = target.dataset.updated === "true";
    
            if (isUpdated) {
                console.log("Delete button clicked for updated booking:");
                console.log("  Booking ID:", bookingId);
                console.log("  Rental Type:", rentalType);
                await deleteUpdatedBooking(bookingId, rentalType);
            }
        }
    });
    function setupDeleteListeners(tableBody) {
        tableBody.addEventListener("click", async (event) => {
            const target = event.target;
            if (target.classList.contains("delete-btn")) {
                const bookingId = target.dataset.id;
                const rentalType = target.dataset.rentalType;
                const isUpdated = target.dataset.updated === "true";

                if (isUpdated) {
                    await deleteUpdatedBooking(bookingId, rentalType);
                }
            }
        });
    }

    // Setup delete listeners for both tables
    setupDeleteListeners(perDayTableBody);
    setupDeleteListeners(perHourTableBody);
});