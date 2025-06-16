console.log("🚗 cars.js loaded successfully");

// Car list
const cars = [
    { name: "Toyota Camry", price: 2000, tripType: "offroad", fuel: "petrol", seating: 4, image: "cars1.png",per_hour_price: 85 },
    { name: "Honda Civic", price: 2300, tripType: "city", fuel: "petrol", seating: 4, image: "cars2.png",per_hour_price: 95 },
    { name: "Ford Mustang", price: 1800, tripType: "offroad", fuel: "diesel", seating: 6, image: "cars3.png",per_hour_price: 75 },
    { name: "Honda City", price: 1500, tripType: "long", fuel: "electric", seating: 4, image: "HondaCity.png",per_hour_price: 63 },
    { name: "BMW M", price: 2800, tripType: "city", fuel: "petrol", seating: 2, image: "BMW_M.png" ,per_hour_price: 116},
    { name: "Porsche", price: 3000, tripType: "city", fuel: "petrol", seating: 2, image: "Porsche.png",per_hour_price: 125 },
    { name: "Honda Amaze", price: 1500, tripType: "long", fuel: "diesel", seating: 4, image: "HondaAmaze.png",per_hour_price: 63 },
    { name: "Honda Elevate", price: 2400, tripType: "offroad", fuel: "electric", seating: 6, image: "HondaElevate.png",per_hour_price: 100 },
    { name: "Porsche 911 GT3", price: 3200, tripType: "city", fuel: "electric", seating: 2, image: "Porsche911_GT3.png",per_hour_price: 134 },
    { name: "Toyota Innova Hycross", price: 2800, tripType: "offroad", fuel: "diesel", seating: 8, image: "Toyota_Innova_Hycross.png",per_hour_price: 116 },
    { name: "Toyota Corolla", price: 2000, tripType: "long", fuel: "diesel", seating: 6, image: "ToyotaCorolla.png",per_hour_price: 85 },
    { name: "Mazda 2", price: 1800, tripType: "city", fuel: "diesel", seating: 6, image: "Mazda2.png",per_hour_price: 75 },
    { name: "Mazda CX-3", price: 1800, tripType: "long", fuel: "petrol", seating: 2, image: "MazdaCX-3.png",per_hour_price: 75 },
    { name: "Mazda CX-5", price: 2000, tripType: "offroad", fuel: "electric", seating: 8, image: "MazdaCX-5.png",per_hour_price: 85 },
    { name: "Mitsubishi Xpander", price: 2800, tripType: "offroad", fuel: "petrol", seating: 9, image: "Mitsubishi_Xpander.png",per_hour_price: 116 }
];

let bookedCars = [];

// Fetch booked cars from backend
async function fetchBookedCars() {
    try {
        const res = await fetch("get_booked_cars.php");
        bookedCars = await res.json();
        console.log("📦 Booked cars from backend:", bookedCars); // 👈 ADD THIS
        displayCars(cars);
        
    } catch (error) {
        console.error("Failed to fetch booked cars:", error);
    }
}
// Display cars dynamically
function displayCars(filteredCars) {
    const carList = document.getElementById("carList");
    carList.innerHTML = ""; // Clear existing content

    filteredCars.forEach(car => {
        const isBooked = bookedCars.includes(car.name);
        const availability = isBooked 
            ? `<span class="status booked">❌ Booked</span>`
            : `<span class="status available">✅ Available</span>`;

        const carDiv = document.createElement("div");
        carDiv.classList.add("car");

        carDiv.innerHTML = `
            <img src="http://localhost/car_rental/${car.image}" 
                 alt="${car.name}" 
                 onerror="this.onerror=null; this.src='http://localhost/car_rental/default-car.png';">
            <h3>${car.name}</h3>
            <p>${car.tripType.charAt(0).toUpperCase() + car.tripType.slice(1)} Trip</p>
            <p>Fuel: ${car.fuel.charAt(0).toUpperCase() + car.fuel.slice(1)}</p>
            <p>Seating: ${car.seating}</p>
            <p class="price">₹${car.price}/day</p>
            <p class="price">₹${car.per_hour_price}/hour</p>
            ${availability}
            <button onclick="rentCar('${car.name}')">Rent Now</button>
        `;
        carList.appendChild(carDiv);
    });
}

// Apply filters based on user selection
function applyFilters() {
    const budget = document.getElementById("budget").value;
    const tripType = document.getElementById("tripType").value;
    const fuelType = document.getElementById("fuelType").value;
    const seating = document.getElementById("seating").value;

    let filteredCars = cars.filter(car => {
        return (budget === "all" || 
                (budget === "low" && car.price <= 2000) ||
                (budget === "medium" && car.price > 2000 && car.price <= 2800) ||
                (budget === "high" && car.price > 2800)) &&
               (tripType === "all" || car.tripType === tripType) &&
               (fuelType === "all" || car.fuel === fuelType) &&
               (seating === "all" || Number(car.seating) === Number(seating));
    });

    displayCars(filteredCars);
}

// Rent a car (store in localStorage & navigate to payment page)
function rentCar(name) {
    const selectedCar = cars.find(car => car.name === name);

    if (!selectedCar) {
        console.error("❌ Selected car not found!");
        return;
    }

    localStorage.setItem("selectedCar", JSON.stringify(selectedCar));
    console.log("✅ Car Selected:", selectedCar);
    window.location.href = "payment.html";
}

// Load cars when the page loads
document.addEventListener("DOMContentLoaded", () => {
    localStorage.removeItem("selectedCar"); // Clear previously selected car
    fetchBookedCars(); // ✅ Fetch booked cars and show availability
});
