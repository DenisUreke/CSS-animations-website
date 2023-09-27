

/*document.querySelector('.addtxt').addEventListener('keydown', function(e) {
    if (e.keyCode === 13) {  // Check if Enter key is pressed
        e.preventDefault(); // Prevent any default behavior

        // Get the value of the input
        const inputText = e.target.value;

        if (inputText) { // Check if input is not empty
            // Create the new comment box
            const newCommentBox = document.createElement('div');
            newCommentBox.className = 'd-flex justify-content-center py-2';

            // Fill the box with the required structure and text
            newCommentBox.innerHTML = `
                <div class="second py-2 px-2">
                    <span class="text1">${inputText}</span>
                    <div class="d-flex justify-content-between py-1 pt-2">
                        <div><span class="text2">Curtis</span></div>
                    </div>
                </div>
            `;

            // Get the left-section container
            const leftSection = document.querySelector('.comment-window-section');

            // Insert the new comment at the beginning of the left-section
            leftSection.insertBefore(newCommentBox, leftSection.firstChild);

            // Clear the input
            e.target.value = '';
        }
    }
});*/

function displayPopupMessage(message, type = 'error') {
    const messageBox = document.getElementById('error-message');
    messageBox.innerText = message;
    messageBox.classList.remove('error', 'success');
    messageBox.classList.add(type);

    // Show the error popup
    const errorPopup = document.getElementById('error-popup');
    errorPopup.style.display = 'block';

    // Scroll to the top to make the popup visible
    window.scrollTo(0, 0);

    // Add an event listener to the close button
    const closeErrorPopupButton = document.getElementById('close-error-popup');
    closeErrorPopupButton.addEventListener('click', () => {
        errorPopup.style.display = 'none';
    });
}

/*Function to check if equal */

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const username = document.getElementById('username-input').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;

    // Check if any of the fields are empty
    if (!email || !username || !password || !password2) {
        displayPopupMessage('All fields are required!');
        return;
    }

    // Check if passwords match
    if (password !== password2) {
        displayPopupMessage('Passwords do not match!');
        return;
    }

    // Use Axios to send a POST request with form data
    axios.post('/reg', {
        email: email,
        username: username,
        password: password,
        password2: password2
    })
    .then(response => {
        if(response.data.success) {
            displayPopupMessage(response.data.message);
            setTimeout(() => {
                displayPopupMessage('User registered successfully!', 'success');
                window.location.href = "/login";
            }, 2000);
        } else {
            displayPopupMessage(response.data.message);
        }
    })
    .catch(error => {
        displayPopupMessage('Error registering. Please try again later.');
    });
});

/* Login form handling */

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const emailOrUsername = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Check if any of the fields are empty
    if (!emailOrUsername || !password) {
        displayPopupMessage('All fields are required!');
        return;
    }

    // Use Axios to send a POST request with login data
    axios.post('/login', {
        emailOrUsername: emailOrUsername,
        password: password
    })
    .then(response => {
        if (response.data.success) {
            displayPopupMessage(response.data.message, 'success');
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 2000);
        } else {
            displayPopupMessage(response.data.message);
        }
    })
    .catch(error => {
        displayPopupMessage('Error logging in. Please try again later.');
    });
});








