

/* ---------------------------------------------------------------------------------*/
/* --------------------------Comment page functions---------------------------------*

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
