document.querySelector('.addtxt').addEventListener('keydown', function(e) {
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
});