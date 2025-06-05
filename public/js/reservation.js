// public/js/reservation.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reservationForm');
  
    form.addEventListener('submit', (e) => {
      const dateInput = document.getElementById('date');
      const selectedDate = new Date(dateInput.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      if (selectedDate < today) {
        e.preventDefault();
        alert("Please select a valid date (today or later).");
      }
    });
  });
  