document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    fetch('/auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
            return;
        }
        return response.json();
    })
    .then(data => {
        if (data && data.error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = data.error;
            
            // Remove any existing error message
            const existingError = document.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Insert error message after the form
            const form = document.getElementById('signupForm');
            form.insertAdjacentElement('afterend', errorDiv);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'An error occurred during registration. Please try again.';
        
        const form = document.getElementById('signupForm');
        form.insertAdjacentElement('afterend', errorDiv);
    });
});