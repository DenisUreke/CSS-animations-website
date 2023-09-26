const express = require('express');
const { engine } = require('express-handlebars');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();


// Initialize the app here
const app = express();

const bcrypt = require('bcrypt');



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

app.get('/log-in', (req, res) => {
    res.render('log-in', { layout: 'loginLayout' });
});


// REGISTER--------------------------------------------------------------------------

// Routes
app.post('/reg', (req, res) => {
    const { email, username, password, password2 } = req.body;

    // Check if any of the fields are empty
    if (!email || !username || !password || !password2) {
        return res.json({ success: false, message: 'All fields are required.' });
    }

    // Check if passwords match
    if (password !== password2) {
        return res.json({ success: false, message: 'Passwords do not match.' });
    }

    // Hash the password using bcrypt
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.json({ success: false, message: 'Error hashing password.' });
        }

        // Now, you can save the hashed password in the database
        db.run('INSERT INTO User (email, username, password) VALUES (?, ?, ?)', [email, username, hashedPassword], (err) => {
            if (err) {
                return res.json({ success: false, message: 'Error saving user.' });
            }

            // User registered successfully
            res.json({ success: true, message: 'User registered successfully!' });
        });
    });
});


/*------------------------------THE REGISTER------------------------------*/


app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});