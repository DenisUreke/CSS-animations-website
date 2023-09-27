const express = require('express');
const { engine } = require('express-handlebars');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();


// Initialize the app here
const app = express();

const bcrypt = require('bcrypt');
const session = require('express-session');



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



/*---------------------------------------------------------*/


/*-------------------------Session-------------------------*/

app.use(session({
    secret: 'yourSecretKey',   // This secret key should be kept private (avoid committing directly to git)
    resave: false,             // Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: false,  // Forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified.
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Cookie expires after 24 hours
    }
}));


/*-------------------------log-out-------------------------*/

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            return res.redirect('/dashboard');  // or wherever you want
        }
        res.redirect('/log-in');
    });
});

/*--------------------Authenticators-----------------------*/

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        return res.json({ success: false, message: 'Not authenticated. Please log in.' });
    }
}

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
        return next();
    } else {
        return res.json({ success: false, message: 'Access denied. Admin privileges required.' });
    }
}

/*---------------------------------------------------------*/

app.get('/script.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(__dirname + '/script.js');
});

/*-----------------------Routes----------------------------*/
app.get('/', (req,res) => {
    res.render('log-in', {layout: 'loginLayout'});
});

app.get('/register', (req,res) => {
    res.render('register', {layout: 'loginLayout'});
});

app.get('/log-in', (req, res) => {
    res.render('log-in', { layout: 'loginLayout' });
});

app.get('/home', (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    res.render('home', { layout: 'adminLayout', isAdmin });
});

app.get('/about', (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    res.render('about', { layout: 'adminLayout', isAdmin });
});

app.get('/projects', (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    res.render('projects', { layout: 'adminLayout', isAdmin });
});

app.get('/experience', (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    res.render('experience', { layout: 'adminLayout', isAdmin });
});
app.get('/holder', (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    res.render('holder', { layout: 'adminLayout', isAdmin });
});
app.get('/holder2', (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    res.render('holder2', { layout: 'adminLayout', isAdmin });
});
app.get('/forum', (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    res.render('forum', { layout: 'adminLayout', isAdmin });
});

/*---------------------------------------------------------*/

/*-----------------------LOG IN----------------------------*/

app.post('/login', async (req, res) => {
    const emailOrUsername = req.body.emailOrUsername;
    const password = req.body.password;

    // First, you can look up the user in the database by email or username.
    const query = `SELECT * FROM User WHERE email = ? OR username = ?`;
    
    db.get(query, [emailOrUsername, emailOrUsername], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error accessing the database.' });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Compare the hashed password in the database with the provided password.
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error during password check.' });
            }

            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Wrong password.' });
            }

            // Set user data and isAdmin status in session
            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin == 1 ? true : false  // Convert the integer to a boolean for easier checking
            };

            return res.status(200).json({ success: true, message: 'Successfully logged in!' });
        });
    });
});

/*---------------------------------------------------------*/

/*---------------------REGISTER----------------------------*/
app.post('/reg', async (req, res) => {
    const { email, username, password, password2 } = req.body;

    try {
        // Check if any of the fields are empty
        if (!email || !username || !password || !password2) {
            throw new Error('All fields are required.');
        }

        // Check if passwords match
        if (password !== password2) {
            throw new Error('Passwords do not match.');
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the user in the database (assuming you're using an asynchronous database library)
        await db.run('INSERT INTO User (email, username, password) VALUES (?, ?, ?)', [email, username, hashedPassword]);

        // User registered successfully
        return res.status(200).json({ success: true, message: 'User registered successfully!' });
    } catch (error) {
        // Handle errors
        return res.status(500).json({ success: false, message: error.message });
    }
});

/*---------------------------------------------------------*/


/*------------------------------THE REGISTER------------------------------*/


app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});