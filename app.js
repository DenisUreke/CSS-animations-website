const express = require('express');
const { engine } = require('express-handlebars');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();


// Initialize the app here
const app = express();



// Then use your middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const port = 8080;

// Database setup
const db = new sqlite3.Database('database.db');

// Handlebars setup
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Static file setup
app.use(express.static('public'));

// Model (data)
const humans = [
    {"id": "0", "name": "Jerome"},
    {"id": "1", "name": "Mira"},
    {"id": "2", "name": "Linus"},
    {"id": "3", "name": "Susanne"},
    {"id": "4", "name": "Jasmin"},
];

app.get('/', (req,res) => {
    res.render('log-in', {layout: 'loginLayout'});
});

app.get('/register', (req,res) => {
    res.render('register', {layout: 'loginLayout'});
});


// REGISTER--------------------------------------------------------------------------

// Routes
app.post('/reg', (req, res) => {
    const { email, username, password, password2 } = req.body;

    // 2. Retrieve the data (already done in the line above)
    
    // 3. Server-side validation
    if (!email || !username || !password || !password2) {
        return res.json({ success: false, message: 'All fields are required.' });
    }

    if (password !== password2) {
        return res.json({ success: false, message: 'Passwords do not match.' });
    }

    // 4. Check for existing users
    db.get('SELECT * FROM User WHERE email = ? OR username = ?', [email, username], (err, user) => {
        if (err) {
            return res.json({ success: false, message: 'Database error.' });
        }

        if (user) {
            return res.json({ success: false, message: 'Email or username already exists.' });
        }

        // 5. Insert the user into the database
        // As you mentioned you aren't hashing the password for this exercise. In a real-world scenario, always hash passwords.
        db.run('INSERT INTO User (email, username, password) VALUES (?, ?, ?)', [email, username, password], (err) => {
            if (err) {
                return res.json({ success: false, message: 'Error saving user.' });
            }

            // 6. Send a response
            res.json({ success: true, message: 'User registered successfully!' });
        });
    });
});


/*------------------------------THE REGISTER------------------------------*/


app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});