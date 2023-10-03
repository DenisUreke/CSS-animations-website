const express = require('express');
const { engine } = require('express-handlebars');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { initDb } = require('./db');

// Add this import to bring in Handlebars
const exphbs = require('express-handlebars');

// Initialize the app here
const app = express();

// Then use your middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const port = 8080;

// Database setup
const db = initDb();

// Handlebars setup
// Register a Handlebars helper to compare two values for equality
exphbs.create({
  helpers: {
    isEqual: function (value1, value2) {
      return value1 === value2;
    },
  },
});

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Static file setup
app.use(express.static('public'));

//**************************************************************************** */
//*********************************Session************************************ */

app.use(session({
    secret: 'yourSecretKey',   // This secret key should be kept private (avoid committing directly to git)
    resave: false,             // Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: false,  // Forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified.
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

//**************************************************************************** */
//******************************Register Page********************************* */

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

//**************************************************************************** */
//******************************Log-in Page*********************************** */

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

//**************************************************************************** */
//************************************Log Out********************************* */

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/log-in');
        }
        res.redirect('/log-in');
    });
});

//**************************************************************************** */
//******************************Authenticators******************************** */

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

//**************************************************************************** */
//****************************Simple Routes*********************************** */

app.get('/', (req, res) => {
    res.render('log-in', { layout: 'loginLayout' });
});

app.get('/register', (req, res) => {
    res.render('register', { layout: 'loginLayout' });
});

app.get('/log-in', (req, res) => {
    res.render('log-in', { layout: 'loginLayout' });
});

app.get('/home', isAuthenticated, (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    res.render('home', { layout: 'adminLayout', isAdmin });
});

app.get('/about', isAuthenticated, (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    res.render('about', { layout: 'adminLayout', isAdmin });
});

app.get('/contactME', isAuthenticated, (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    res.render('contact-information', { layout: 'adminLayout', isAdmin });
});

app.get('/experience', isAuthenticated, (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    res.render('experience', { layout: 'adminLayout', isAdmin });
});

app.get('/holder', isAuthenticated, (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    res.render('holder', { layout: 'adminLayout', isAdmin });
});

//**************************************************************************** */
//*******************************Download CV********************************** */

app.get('/downloadCV', isAuthenticated, (req, res) => {

    const sql = 'SELECT description FROM Download WHERE name = "CV"';

    db.get(sql, (err, row) => {
        if (err) {
            if (err) {
                const error = 'Error retrieving CV data';
                const errorCode = '500';
                const model = {
                    ErrorCode: errorCode,
                    Error: error,
                    layout: 'loginLayout',
                };
                res.render('errorPage.handlebars', model);
                return;
            }
        }
        if (!row) {
            if (err) {
                const error = 'CV data not found';
                const errorCode = '404';
                const model = {
                    ErrorCode: errorCode,
                    Error: error,
                    layout: 'loginLayout',
                };
                res.render('errorPage.handlebars', model);
                return;
            }
        }

        const myCV = row.description;
        const fileName = 'CV.txt';

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`); /*Thank you JavidX from Stack Overflow!*/
        res.setHeader('Content-Type', 'text/plain');

        res.send(myCV);
    });
});

//**************************************************************************** */
//*******************************Contact me*********************************** */

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
//*********************************Projects*********************************** */

app.get('/projects', isAuthenticated, (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;

    db.all("SELECT * FROM Projects", function (error, mystuff) {
        if (error) {
            const model = {
                theError: error,
                projects: [],
                layout: 'adminLayout',
                isAdmin
            }
            res.render("projects.handlebars", model)
        }
        else {
            const model = {
                theError: "",
                projects: mystuff,
                layout: 'adminLayout',
                isAdmin
            }
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

//**************************************************************************** */
//***********************************Forum************************************ */

app.get('/forum', isAuthenticated, (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    const loggedInUser = req.session.user && req.session.user.username;

    const query = `
    SELECT *
    FROM Comments
    ORDER BY created_at DESC
    LIMIT 5;
    `;

    db.all(query, (err, comments) => {

        if (err) {
            const errorMessage = err.message;
            const model = {
                Status: errorMessage,
                layout: 'loginLayout',
                message: [],
                isAdmin
            }
            res.render("errorPage.handlebars", model);
            return;
        } else {


            const success = 'Successful entry';
            const model = {
                Status: success,
                layout: 'adminLayout',
                comments,
                isAdmin
            }
            res.render("forum.handlebars", model);
            return;
        }

    });
});


app.post('/post-comment', isAuthenticated, async (req, res) => {
    const { post } = req.body;
    const posterId = req.session.user.id;
    const name = req.session.user.username;

    try {
        await db.run('INSERT INTO Comments (post, poster, username) VALUES (?, ?, ?)', [post, posterId, name]);
        res.redirect('/forum');
    }
    catch (error) {

        console.error('Error saving comment:', error);
        res.status(500).json({ success: false, message: 'Failed to save the comment.' });
    }
});

//**************************************************************************** */
//************************************Admin*********************************** */

app.get('/admin', isAdmin, (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    res.render('admin-main-window', { layout: 'guestLayout', isAdmin });
});

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
        res.render("admin-main-window.handlebars", model)
    }
});

app.post('/middleware-run', (req, res, next) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    const query = req.body.query;
    const words = query.split(" ");

    if (words[0] == 'SELECT') {

        db.all(query, function (error, data) {

            if (error) {
                const errorMessage = error.message;
                const model = {
                    Status: errorMessage,
                    layout: 'guestLayout',
                    Message: [],
                    isAdmin
                }
                res.render("admin-main-window.handlebars", model);
                return;
            } else {


                const success = 'Successful entry';
                const model = {
                    Status: success,
                    layout: 'guestLayout',
                    Message: JSON.stringify(data, null, 4),
                    isAdmin
                }
                res.render("admin-main-window.handlebars", model);
                return;
            }
        });
    }
    else {
        return next();
    }
});


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
                res.render("admin-main-window.handlebars", model);
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
                res.render("admin-main-window.handlebars", model);
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
                res.render("admin-main-window.handlebars", model);
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
                res.render("admin-main-window.handlebars", model);
                return;
            }
        })
    }
});

//**************************************************************************** */
//*******************************Pagination*********************************** */

app.get('/pagination', async (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;

    const actionType = req.query.actionType;
    const total = parseInt(req.query.total); /*Only interesting when previous and next are used*/
    let page;
    let limit;
    let selectedTable;

    if (actionType === 'search') {
        page = parseInt(req.query.page);
        limit = parseInt(req.query.limit);
        selectedTable = req.query.table;
    }

    else if (actionType === 'next') {
        page = parseInt(req.query.current);
        if (page < total) {
            page++;
        }
        limit = parseInt(req.query['limit-2']);
        selectedTable = req.query.table;
    }

    else if (actionType === 'previous') {
        page = parseInt(req.query.current);
        if (page > 1) {
            page--;
        }
        limit = parseInt(req.query['limit-2']);
        selectedTable = req.query.table;
    }

    let totalCount = 0;

    const countSql = `SELECT COUNT(*) as total FROM ${selectedTable}`;
    db.get(countSql, [], (err, row) => {
        if (err) {
            const errorMessage = err.message;
            const model = {
                Status: errorMessage,
                layout: 'guestLayout',
                Message: [],
            }
            res.render("admin-main-window.handlebars", model);
            return;
        }

        totalCount = row.total;
        const totalPages = Math.ceil(totalCount / limit);

        if (page > totalPages) {
            page = totalPages
        };
        const offset = (page - 1) * limit;

        const sql = `SELECT * FROM ${selectedTable} LIMIT ? OFFSET ?`;
        db.all(sql, [limit, offset], (err, rows) => {
            if (err) {
                const errorMessage = err.message;
                const model = {
                    Status: errorMessage,
                    layout: 'guestLayout',
                    Message: [],
                }
                res.render("admin-main-window.handlebars", model);
                return;
            }
            const model = {
                current: +page,
                total: +totalPages,
                table: selectedTable,
                limit: limit,
                layout: 'guestLayout',
                Message: JSON.stringify(rows, null, 4),
                isAdmin
            };

            res.render("admin-main-window.handlebars", model);
            return;

        });
    });
});
//**************************************************************************** */
//**************************************************************************** */


app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});