function displayPopupMessage(message) {
    const popupMessage = document.getElementById('popup-message');
    const popupOverlay = document.getElementById('popup-overlay');
    const closePopupButton = document.getElementById('close-popup');

    popupMessage.textContent = message;

    popupOverlay.style.display = 'block';

    closePopupButton.addEventListener('click', () => {
        popupOverlay.style.display = 'none';
    });
}
/* ----------------------------LOG IN------------------------------------------*/


document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const emailOrUsername = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!emailOrUsername || !password) {
        displayPopupMessage('All fields are required!');
        return;
    }

    /*Axios*/
    axios({
        method: 'post',
        url: '/login',
        data: {
            emailOrUsername: emailOrUsername,
            password: password
        }
    })
    .then(response => {
        if (response.data.success) {
                window.location.href = '/home';
        } else {
            displayPopupMessage(response.data.message);
        }
    })
    .catch(error => {
        displayPopupMessage('Error logging in. Please try again later.');
    });
});

/* ----------------------------REGISTER------------------------------------------*/

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const username = document.getElementById('username-input').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;

    if (!email || !username || !password || !password2) {
        displayPopupMessage('All fields are required!');
        return;
    }

    if (password !== password2) {
        displayPopupMessage('Passwords do not match!');
        return;
    }

    axios.post('/reg', {
        email: email,
        username: username,
        password: password,
        password2: password2
    })
    .then(response => {
        if(response.data.success) {
            /*displayPopupMessage(response.data.message);---------------------------------------------------------------------CHECK THIS------*/
            /*setTimeout(() => {
                displayPopupMessage('User registered successfully!', 'success');*/
                window.location.href = '/log-in';
          /*  }, 2000);*/
        } else {
            displayPopupMessage(response.data.message);
        }
    })
    .catch(error => {
        displayPopupMessage('Error registering. Please try again later.');
    });
});

/* ---------------------------------------------------------------------------------*/
/* --------------------------Comment page functions---------------------------------*/

/*update the divs*/
function updateCommentsDiv(comments){

    for(let i = 0; i < comments.length; i++){
        const commentBox = document.getElementById(`comment-box-${i + 1}`);
        const commentName = commentBox.querySelector('.comment-name');
        const commentDate = commentBox.querySelector('.comment-date');
        const commentContent = commentBox.querySelector(`#comment-${i + 1}`);

        const comment = comments[i];

        commentName.textContent = comment.poster_name;
        commentDate.textContent = comment.comment_timestamp;
        commentContent.textContent = comment.comment_post;
    }
}

/*get the comments client-side*/
function fetchLatestComments() {
    fetch('/get-latest-comments')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const comments = data.comments;
                updateCommentsDiv(comments);
            } else {
                console.error('Error fetching comments:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching comments:', error);
        });
}

window.addEventListener('load', fetchLatestComments); /*REMOVE later-------------------------------------------------------------- */

/* ---------------------------------------------------------------------------------*/
/* -------------------------Function to get first word------------------------------*/

function getFirstWord(query){

    const inputString = query;
    const words = inputString.split(" ");
    return words[0];
}

/* ---------------------------------------------------------------------------------*/
/* ------------------------------Litsener to submit---------------------------------*/

const submitButton = document.getElementById('submitButton-sql');

submitButton.addEventListener('click', function (event) {
    console.log('insidethisshit');
    event.preventDefault();

    const inputTextarea = document.getElementById('admin-sql');
    const inputValue = inputTextarea.value;

    if(getFirstWord(inputValue) == 'SELECT'){

    }
    else if(getFirstWord(inputValue) == 'UPDATE' || getFirstWord(inputValue) == 'INSERT' || getFirstWord(inputValue) == 'CREATE' || getFirstWord(inputValue) == 'ALTER'){

    }
    else if(getFirstWord(inputValue) == 'DROP' || getFirstWord(inputValue) == 'DELETE'){

    }
    else{
        const serverMessageWindow = document.getElementsByClassName('server-message-window');
        serverMessageWindow.innerText = 'error';
        
    }
});
/* ---------------------------------------------------------------------------------*/
