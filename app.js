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
/*---------------------------------------------------------*/
/*-------------------------log-out-------------------------*/

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/log-in');
        }
        res.redirect('/log-in');
    });
});

/*---------------------------------------------------------*/
/*--------------------Authenticators-----------------------*/

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        const error = 'You need to be logged in to be on this page';
        const errorcode = '401';
        const model = {
            Error: error,
            ErrorCode: errorcode,
            layout: 'loginLayout',
        }
        res.render("errorPage.handlebars", model);
        return;
    }
}

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
        return next();
    } else {
        const error = 'Unauthorized access admins, only';
        const errorcode = '401';
        const model = {
            Error: error,
            ErrorCode: errorcode,
            layout: 'loginLayout',
        }
        res.render("errorPage.handlebars", model);
        return;
    }
}
/*---------------------------------------------------------*/
/*---------------------REGISTER----------------------------*/

app.post('/reg', (req, res) => {
    const { email, username, password, password2 } = req.body;
    const cleanedUsername = username.trim();
    
    db.get('SELECT username FROM User WHERE username = ?', [cleanedUsername], async (err, row) => {
        if (err) {
            console.error('Database error:', err);
            const error = 'An unexpected error occurred. Please try again.';
            const model = {
                Error: error,
                layout: 'loginLayout',
            }
            res.render("register.handlebars", model);
            return;
        }
        
        if (row) {
            const error = 'Username or email already in use';
            const model = {
                Error: error,
                layout: 'loginLayout',
            }
            res.render("register.handlebars", model);
            return;
        } 
        else if (password !== password2) {
            const error = 'Passwords do not match';
            const model = {
                Error: error,
                layout: 'loginLayout',
            }
            res.render("register.handlebars", model);
            return;
        } 
        else {
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                await db.run('INSERT INTO User (email, username, password) VALUES (?, ?, ?)', [email, username, hashedPassword]);

                const success = 'Registration Successful!';
                const model = {
                    Success: success,
                    layout: 'loginLayout',
                }
                res.render("log-in.handlebars", model);

            } catch (error) {
                console.error('Error inserting user:', error);
                res.status(500).send("Database error");
            }
        }
    });
});
/*---------------------------------------------------------*/
/*-----------------------LOG IN----------------------------*/

app.post('/login', async (req, res) => {
    const emailOrUsername = req.body.emailOrUsername;
    const password = req.body.password;

    const query = `SELECT * FROM User WHERE email = ? OR username = ?`;

    db.get(query, [emailOrUsername, emailOrUsername], (err, user) => {

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
/*---------------------------------------------------------*/

app.get('/script.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(__dirname + '/script.js');
});

/*-----------------------Routes----------------------------*/
app.get('/downloadCV', isAuthenticated, (req, res) => {

    const myCV = "This is my CV =).";

    const fileName = 'CV.txt';

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`); /*Thank you JavidX from Stack-Overflow!*/
    res.setHeader('Content-Type', 'text/plain');

    res.send(myCV);
});

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

app.get('/contactME', (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    res.render('contact-information', { layout: 'adminLayout', isAdmin });
});
//**************************************************************************** */
//**************************************************************************** */
//**************************************************************************** */
//**************************************************************************** */

//*******************************Send Message******************************** */

app.post('/send-message', (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    const { email, message } = req.body;
    const { username } = req.session.user;



    db.run(
        'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)',
        [username, email, message],
        (err) => {
            if (err) {
                const error = 'Internal Server Error';
                const errorCode = '500';
                const model = {
                    ErrorCode: errorCode,
                    Error: error,
                    layout: 'loginLayout',
                    isAdmin,
                };
                res.render('errorPage.handlebars', model);
                return;
            } else {
                const successMessage = 'You have successfully sent a message';
                const model = {
                    message: successMessage,
                    layout: 'adminLayout',
                    isAdmin,
                };
                res.render('contact-information.handlebars', model);
                return;
            }
        }
    );
});

//**************************************************************************** */
app.get('/projects', isAuthenticated, (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;

    db.all("SELECT * FROM ProjectData", function (error, mystuff) {
        if (error) {
            const model = {
                theError: error,
                projects: [],
                layout: 'adminLayout',
                isAdmin
            }
            // renders the page with the model
            res.render("projects.handlebars", model)
        }
        else {
            const model = {
                theError: "",
                projects: mystuff,
                layout: 'adminLayout',
                isAdmin
            }
            // renders the page with the model
            res.render("projects.handlebars", model)
        }
    })
});

app.get('/project-description-:id', (req, res) => {
    const projectId = req.params.id;
    const isAdmin = req.session.user && req.session.user.isAdmin;

    db.get("SELECT * FROM Projects WHERE id = ?", [projectId], function (error, project) {
        if (error) {
            const model = {
                theError: error,
                layout: 'loginLayout',
                isAdmin,
            };
            res.render("error.handlebars", model);
        } else if (!project) {
            const model = {
                theError: "Project not found",
                layout: 'loginLayout',
                isAdmin,
            };
            res.render("error.handlebars", model);
        } else {
            const model = {
                project,
                layout: 'loginLayout',
                isAdmin,
            };
            res.render('project-description.handlebars', { project, layout: 'loginLayout', isAdmin });
        }
    });
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

app.get('/forum', isAuthenticated, (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    const loggedInUser = req.session.user && req.session.user.username;

    const query = `
        SELECT *
        FROM CommentViewWithAuthor
        ORDER BY comment_timestamp DESC
        LIMIT 5
    `;

    db.all(query, [], (err, comments) => {
        if (err) {
            console.error('Error fetching latest comments:', err);
            res.status(500).render('error', { layout: 'adminLayout', isAdmin });
        } else {
            // Here, add a property to each comment to determine if the delete button should be shown
            comments.forEach(comment => {
                comment.canDelete = comment.poster_name === loggedInUser;
            });

            res.render('forum', { layout: 'adminLayout', isAdmin, comments });
        }
    });
});


app.get('/admin', isAdmin, (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    res.render('admin-main-window', { layout: 'guestLayout', isAdmin });
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

app.post('/middleware-run', (req, res, next) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    const requestString = req.body;
    const query = requestString.query;
    const words = requestString.query.split(" ");

    const validCommands = ['SELECT', 'CREATE', 'INSERT', 'UPDATE', 'ALTER', 'DELETE', 'DROP'];

    if (validCommands.includes(words[0])) {
        return next();

    } else {
        const error = 'Invalid SQL command';
        const model = {
            Status: error,
            layout: 'guestLayout',
            Message: [],
            isAdmin
        }
        res.render("admin.handlebars", model)
    }
});

/*----------------------------------------------------------------------------------------------------*/
app.post('/middleware-run', (req, res, next) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    const query = req.body.query;
    const words = query.split(" ");

    if (words[0] == 'SELECT') {
        let queryData;

        db.all(query, function (error, data) {

            if (error) {
                const errorMessage = error.message;
                const model = {
                    Status: errorMessage,
                    layout: 'guestLayout',
                    Message: [],
                    isAdmin
                }
                res.render("admin.handlebars", model);
                return;
            } else {

                queryData = data;

                let formattedData = '';

                for (const user of queryData) {
                    const idPadding = ' '.repeat(5 - user.id.toString().length); // Adjust the padding width as needed
                    const usernamePadding = ' '.repeat(25 - user.username.length); // Adjust the padding width as needed
                    const emailPadding = ' '.repeat(30 - user.email.length); // Adjust the padding width as needed
                    const isAdminPadding = ' '.repeat(7 - String(user.isAdmin).length); // Adjust the padding width as needed

                    formattedData += `ID: ${user.id}${idPadding}Username: ${user.username}${usernamePadding}Email: ${user.email}${emailPadding}Admin: ${user.isAdmin}${isAdminPadding}\n`;
                }

                const success = 'Successful entry';
                const model = {
                    Status: success,
                    layout: 'guestLayout',
                    Message: formattedData,
                    isAdmin
                }
                res.render("admin.handlebars", model);
                return;
            }
        });
    }
    else {
        return next();
    }
});

/*----------------------------------------------------------------------------------------------------*/

app.post('/middleware-run', (req, res, next) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    const query = req.body.query;
    const words = query.split(" ");

    if (words[0] == 'DELETE' || words[0] == 'DROP') {
        db.run(query, function (error, data) {

            if (error) {
                const errorMessage = error.message;
                const model = {
                    Status: errorMessage,
                    layout: 'guestLayout',
                    Message: [],
                    isAdmin
                }
                res.render("admin.handlebars", model);
                return;
            }
            else {
                const successMessage = 'Query executed successfully.';
                const model = {
                    Status: successMessage,
                    layout: 'guestLayout',
                    Message: [],
                    isAdmin
                }
                res.render("admin.handlebars", model);
                return;
            }

        })
    }
    else {
        return next();
    }
});

app.post('/middleware-run', (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    const query = req.body.query;
    const words = query.split(" ");

    const validCommands = ['CREATE', 'INSERT', 'UPDATE', 'ALTER'];

    if (validCommands.includes(words[0])) {
        db.run(query, function (error, data) {

            if (error) {
                const errorMessage = error.message;
                const model = {
                    Status: errorMessage,
                    layout: 'guestLayout',
                    Message: [],
                    isAdmin
                }
                res.render("admin.handlebars", model);
                return;
            }
            else {
                const successMessage = 'Query executed successfully.';
                const model = {
                    Status: successMessage,
                    layout: 'guestLayout',
                    Message: [],
                    isAdmin
                }
                res.render("admin.handlebars", model);
                return;
            }
        })
    }
});

app.get('/pagination', async (req, res) => {
    
    const actionType = req.query.actionType;
    const total = parseInt(req.query.total); /*Only interesting when previous and next are used*/
    let page;
    let limit;
    let selectedTable;

    console.log(actionType);
    console.log(total);

    if(actionType === 'search'){
        page = parseInt(req.query.page);
        limit = parseInt(req.query.limit);
        selectedTable = req.query.table;
    }

    else if(actionType === 'next'){
        page = parseInt(req.query.current);
        if(page < total){
            page = (page + 1);
        }
        limit = parseInt(req.query['limit-2']);
        selectedTable = req.query.table;
    }

    else if(actionType === 'previous'){
        page = parseInt(req.query.current);
        if(page > 1){
            page = (page - 1);
        }
        limit = parseInt(req.query['limit-2']);
        selectedTable = req.query.table;
    }

    const offset = (page - 1) * limit;

    let totalCount = 0;

    /*Getting count*/
    const countSql = `SELECT COUNT(*) as total FROM ${selectedTable}`;
    db.get(countSql, [], (err, row) => {
        if (err) {
            console.error('Failed to retrieve count:', err);
            res.status(500).send('Internal server error');
            return;
        }

        totalCount = row.total;
        const totalPages = Math.ceil(totalCount / limit);

        const sql = `SELECT * FROM ${selectedTable} LIMIT ? OFFSET ?`;
        db.all(sql, [limit, offset], (err, rows) => {
            if (err) {
                console.error('Failed to retrieve users:', err);
                res.status(500).send('Internal server error');
                return;
            }

            const model = {
                current: +page,
                total: +totalPages,
                table: selectedTable,
                limit: limit,
                layout: 'guestLayout',
                Message: JSON.stringify(rows, null, 4),
            };

            res.render("admin-main-window.handlebars", model);
            return;

        });
    });
});



    app.listen(port, () => {
        console.log(`Server started on http://localhost:${port}`);
    });