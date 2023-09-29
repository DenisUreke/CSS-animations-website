const express = require('express');
const { engine } = require('express-handlebars');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');


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
    { "id": "0", "name": "Jerome" },
    { "id": "1", "name": "Mira" },
    { "id": "2", "name": "Linus" },
    { "id": "3", "name": "Susanne" },
    { "id": "4", "name": "Jasmin" },
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
        if (err) {
            return res.redirect('/log-in');
        }
        res.redirect('/log-in');
    });
});

/*--------------------Authenticators-----------------------*/

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
        return next();
    } else {
        return res.json({ success: false, message: 'Access denied. Admin privileges required.' });
    }
}

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        return res.json({ success: false, message: 'Not authenticated. Please log in.' });
    }
}

/*---------------------------------------------------------*/

app.get('/script.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(__dirname + '/script.js');
});

/*-----------------------Routes----------------------------*/
app.get('/', (req, res) => {
    res.render('log-in', { layout: 'loginLayout' });
});

app.get('/register', (req, res) => {
    res.render('register', { layout: 'loginLayout' });
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

    // Fetch the 5 latest comments
    const query = `
        SELECT *
        FROM CommentViewWithAuthor
        ORDER BY comment_timestamp DESC
        LIMIT 5
    `;

    db.all(query, [], (err, comments) => {
        if (err) {
            console.error('Error fetching latest comments:', err);
            // Handle the error, e.g., by rendering an error page
            res.status(500).render('error', { layout: 'adminLayout', isAdmin });
        } else {
            // Render the 'forum' template with the latest comments
            res.render('forum', { layout: 'adminLayout', isAdmin, comments });
        }
    });
});
app.get('/admin', (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    res.render('admin', { layout: 'guestLayout', isAdmin });
});

/*---------------------------------------------------------*/

/*-----------------------LOG IN----------------------------*/

app.post('/login', async (req, res) => {
    const emailOrUsername = req.body.emailOrUsername;
    const password = req.body.password;

    const query = `SELECT * FROM User WHERE email = ? OR username = ?`;

    db.get(query, [emailOrUsername, emailOrUsername], (err, user) => {

        const username2 = user.username;
        console.log(username2);

        if (err) {
            const error = 'Code 500: Error accessing the database.';
            const model = {
                Error: error,
                layout: 'loginLayout',
        }
        res.render("log-in.handlebars", model);
        return;
    }

        else if (!user) {
            const error = 'Code 404: User not found.';
            const model = {
                Error: error,
                layout: 'loginLayout',
        }
        res.render("log-in.handlebars", model);
        return;
    }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                const error = 'Code 500 Can not access password.';
                const model = {
                    Error: error,
                    layout: 'loginLayout',
                }
                res.render("log-in.handlebars", model);
                return;
            }

            if (!isMatch) {
                const error = 'Wrong Password.';
                const model = {
                    Error: error,
                    layout: 'loginLayout',
            }
            res.render("log-in.handlebars", model);
            return;
            }

            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin == 1 ? true : false
            };

            res.redirect('/home');
        });
    });
});

/*---------------------------------------------------------*/

/*---------------------REGISTER----------------------------*/
app.post('/reg', async (req, res) => {
    const { email, username, password, password2 } = req.body;

    console.log('it enter atleast');

    // Check if the username or email already exists
    console.log("Searching for username:", username);

    const cleanedUsername = username.trim();

    console.log("Cleaned username:",cleanedUsername);

    const existingUsername = db.get('SELECT username FROM User WHERE username = ?', [cleanedUsername]);
    
    console.log("Result:", existingUsername);

    if (existingUsername != null && Object.keys(existingUsername).length !== 0) {
        console.log(existingUsername);
        const error = 'Username or email already in use';
        const model = {
            Error: error,
            layout: 'loginLayout',
        }
        res.render("register.handlebars", model);
        return;

    } else if (password !== password2) {
        const error = 'Passwords do not match';
        const model = {
            Error: error,
            layout: 'loginLayout',
        }
        res.render("register.handlebars", model);
        return;

    } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.run('INSERT INTO User (email, username, password) VALUES (?, ?, ?)', [email, username, hashedPassword]);

        const success = 'Registration Successful!';
        const model = {
            Success: success,
            layout: 'loginLayout',
        }
        res.render("log-in.handlebars", model);
    }
});

/*---------------------------------------------------------*/
/*--------------------Post Comment-------------------------*/

app.post('/post-comment', isAuthenticated, async (req, res) => {
    const { post } = req.body;
    const posterId = req.session.user.id; // Get the user's ID from the session

    try {
        await db.run('INSERT INTO Comments (post, poster) VALUES (?, ?)', [post, posterId]);
        res.redirect('/forum');
    }
    catch (error) {

        console.error('Error saving comment:', error);
        res.status(500).json({ success: false, message: 'Failed to save the comment.' });
    }
});

/*--------------------Get Comment-------------------------*/

app.get('/get-latest-comments', (req, res) => {
    console.log('Inside-server-side');
    const query = `
        SELECT *
        FROM CommentViewWithAuthor
        ORDER BY comment_timestamp DESC
        LIMIT 5
    `;

    db.all(query, [], (err, comments) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error fetching comments.' });
        } else {
            res.status(200).json({ success: true, comments: comments });
        }
    });
});

/*-------------------------------Admin-Form-------------------------------*/

app.post('/your-server-endpoint', (req, res, next) => {
    const requestString = req.body;
    const query = requestString.query;
    const words = requestString.query.split(" ");

    const validCommands = ['SELECT', 'CREATE', 'INSERT', 'UPDATE', 'ALTER', 'DELETE', 'DROP'];

    if (validCommands.includes(words[0])) {
        next();

    } else {
        const error = 'Invalid SQL command';
        const model = {
            Status: error,
            layout: 'guestLayout',
            Message: []
        }
        res.render("admin.handlebars", model)
    }
});

app.post('/your-server-endpoint', (req, res, next) => {
    const query = req.body.query;

    if (!query) {
        const error = 'No SQL query provided';
        const model = {
            Status: error,
            layout: 'guestLayout',
            Message: []
        }
        res.render("admin.handlebars", model);
        return;
    }

    const words = query.split(" ");

    if (words[0] == 'SELECT') {
        let queryData;
        
        db.all(query, function (error, data) {

            if (error) {
                const errorMessage = error.message;
                const model = {
                    Status: errorMessage,
                    layout: 'guestLayout',
                    Message: []
                }
                res.render("admin.handlebars", model);
                return;
            } else {

                queryData = data;

                let formattedData = '';
    
                for (const user of queryData) {
                    formattedData += `ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`;
                }

                const success = 'Successful entry';
                const model = {
                    Status: success,
                    layout: 'guestLayout',
                    Message: formattedData,
                }
                res.render("admin.handlebars", model);
                return;
            }
        });
    }
    else{
        next();
    }
});

app.post('/your-server-endpoint', (req, res) =>{
    const requestString = req.body;
    const query = requestString.query;
    const words = requestString.query.split(" ");

    if(words[0] == 'DELETE' || words[0] == 'DROP'){
        

    }
    else{
        next();
    }
})



/* */
/*app.get('/projectddds', (req, res) => {
    db.all("SELECT * FROM projects", function (error, theProjects) {
        if (error) {
            const model = {
                dbError: true,
                theError: error,
                projects: []
            }
            // renders the page with the model
            res.render("projects.handlebars", model)
        }
        else {
            const model = {
                dbError: false,
                theError: "",
                projects: theProjects
            }
            // renders the page with the model
            res.render("projects.handlebars", model)
        }
      })
});*/



app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});

