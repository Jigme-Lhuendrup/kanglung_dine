//Login & Signup
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
  
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        const email = loginForm.email.value.trim();
        const password = loginForm.password.value.trim();
        if (!email || !password) {
          e.preventDefault();
          alert("Please fill out all fields.");
        }
      });
    }
  
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        const name = signupForm.name.value.trim();
        const email = signupForm.email.value.trim();
        const password = signupForm.password.value.trim();
        if (!name || !email || !password) {
          e.preventDefault();
          alert("Please fill out all fields.");
        }
      });
    }
  });
  