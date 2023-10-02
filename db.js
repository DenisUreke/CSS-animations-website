/****************************************************************************************************/
/**************************************Tables and Data***********************************************/
/*----User----*/

db.run(`CREATE TABLE IF NOT EXISTS User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    isAdmin INTEGER DEFAULT 0,
    registrationDate TEXT DEFAULT CURRENT_TIMESTAMP
)`, (error) => {
    if (error) {
        console.log("ERROR: ", error);
    } else {
        console.log("---> Table User created!");

        const users = [
            ['admin', 'admin@admin.com', '$2b$10$hXpK/CA.6ZAafP4c6lLJVOI8probXnVcK4UxJK86LOzpokE2qZsyu', 1],
            ['Andy', 'andy@mail.com', 'password123', 0],
            ['Brian', 'brian@mail.com', 'password124', 0],
            ['Chloe', 'chloe@mail.com', 'password125', 0],
            ['David', 'david@mail.com', 'password126', 0],
            ['Ella', 'ella@mail.com', 'password127', 0],
            ['Frank', 'frank@mail.com', 'password128', 0],
            ['Grace', 'grace@mail.com', 'password129', 0],
            ['Helen', 'helen@mail.com', 'password130', 0],
            ['Ian', 'ian@mail.com', 'password131', 0],
            ['Julia', 'julia@mail.com', 'password132', 0],
            ['Kevin', 'kevin@mail.com', 'password133', 0],
            ['Lana', 'lana@mail.com', 'password134', 0],
            ['Mike', 'mike@mail.com', 'password135', 0],
            ['Nina', 'nina@mail.com', 'password136', 0],
            ['Oscar', 'oscar@mail.com', 'password137', 0],
            ['Penny', 'penny@mail.com', 'password138', 0],
            ['Quinn', 'quinn@mail.com', 'password139', 0],
            ['Rose', 'rose@mail.com', 'password140', 0],
            ['Steve', 'steve@mail.com', 'password141', 0],
            ['Tina', 'tina@mail.com', 'password142', 0],
            ['Ulysses', 'ulysses@mail.com', 'password143', 0],
            ['Vera', 'vera@mail.com', 'password144', 0],
            ['Walter', 'walter@mail.com', 'password145', 0],
            ['Xena', 'xena@mail.com', 'password146', 0],
            ['Yara', 'yara@mail.com', 'password147', 0],
            ['Zane', 'zane@mail.com', 'password148', 0],
            ['Alice', 'alice@mail.com', 'password149', 0],
            ['Bob', 'bob@mail.com', 'password150', 0],
            ['Carter', 'carter@mail.com', 'password151', 0],
            ['Daisy', 'daisy@mail.com', 'password152', 0],
            ['Erik', 'erik@mail.com', 'password153', 0],
            ['Flora', 'flora@mail.com', 'password154', 0],
            ['George', 'george@mail.com', 'password155', 0],
            ['Hannah', 'hannah@mail.com', 'password156', 0],
            ['Isaac', 'isaac@mail.com', 'password157', 0],
            ['Jenna', 'jenna@mail.com', 'password158', 0],
            ['Kurt', 'kurt@mail.com', 'password159', 0],
            ['Lily', 'lily@mail.com', 'password160', 0],
            ['Mason', 'mason@mail.com', 'password161', 0],
            ['Nora', 'nora@mail.com', 'password162', 0]
        ];

        users.forEach(([username, email, password, isAdmin]) => {
            db.run(`INSERT INTO User (username, email, password, isAdmin) VALUES (?, ?, ?, ?)`, [username, email, password, isAdmin], function(err) {
                if (err) {
                    return console.error(err.message);
                }
                console.log(`Inserted user with id: ${this.lastID}`);
            });
        });
    }
});

/*----Download----*/

db.run(`CREATE TABLE IF NOT EXISTS Download (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    item BLOB,
    uploaded TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, (error) => {
    if (error) {
        console.log("ERROR: ", error);
    } else {
        console.log("---> Table Download created!");

        const insertDownloadsSQL = `
            INSERT INTO Download (name, description)
            VALUES 
                ('CV', 'This is my CV. Hire me! =)'),
                ('Tetris', 'Crafted my first game, Tetris, using QT and C++. A monumental step in my programming journey. Score isn''t implemented but it''s working with a few "minor" bugs ehm.. features'),
                ('Black-Jack', 'Developed a dynamic Blackjack game, where players challenge a computer opponent. My second gaming creation.'),
                ('Math-tool', 'Crafted a C++ terminal tool during my Discrete Math course. It efficiently executes the Euclidean algorithm and aids in identifying inverses for encryption math.'),
                ('CSS Animation', 'My inaugural web project showcases original CSS art crafted by me. It''s a work in progress - feel free to click the link and witness its evolution!'),
                ('Visual-Sorting', 'My early visual creation: an array of sorting algorithms on display, letting you visually experience the sorting process in action.');
        `;
        db.run(insertDownloadsSQL, (error) => {
            if (error) {
                console.log("ERROR inserting downloads: ", error);
            } else {
                console.log("---> Downloads inserted!");
            }
        });
    }
});


/*----Comment----*/

db.run(`CREATE TABLE IF NOT EXISTS Comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post TEXT NOT NULL,
    poster INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    author_id INTEGER,
    FOREIGN KEY(poster) REFERENCES User(id)
)`, (error) => {
    if (error) {
        console.log("ERROR: ", error);
    } else {
        console.log("---> Table Comments created!");

        const insertCommentsSQL = `
            INSERT INTO Comments (post, poster)
            VALUES 
                ('This site certainly deserves a 5!', 2),
                ('I like chocolate!', 7),
                ('The download section rocks.', 15),
                ('I'm loving the interface.', 10),
                ('This post is helpful.', 25),
                ('Awesome projects!', 34),
                ('This is insightful.', 21),
                ('The download section rocks.', 31),
                ('Keep up the good work.', 27),
                ('Super user-friendly.', 38);
        `;
        db.run(insertCommentsSQL, (error) => {
            if (error) {
                console.log("ERROR inserting comments: ", error);
            } else {
                console.log("---> Comments inserted!");
            }
        });
    }
});

/*----Messages----*/

db.run(`CREATE TABLE IF NOT EXISTS Messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    message TEXT,
    messageDate TEXT DEFAULT CURRENT_TIMESTAMP,
    email TEXT
)`, (error) => {
    if (error) {
        console.log("ERROR: ", error);
    } else {
        console.log("---> Table Messages created!");

        const insertMessagesSQL = `
            INSERT INTO Messages (name, message, email)
            VALUES 
                ('Andy', 'Hey! I had an amazing trip to the mountains last weekend. The view was breathtaking!', 'andy@mail.com'),
                ('Brian', 'Do you have any recommendations for a good book to read?', 'brian@mail.com'),
                ('Chloe', 'I attended a cooking class yesterday. I can now make pasta from scratch!', 'chloe@mail.com'),
                ('David', 'Have you ever tried scuba diving? I''m thinking of taking a course.', 'david@mail.com'),
                ('Ella', 'The concert last night was fantastic! The band played all their classic hits.', 'ella@mail.com'),
                ('Frank', 'I''m planning to visit Japan next summer. Any travel tips?', 'frank@mail.com'),
                ('Grace', 'How do I update my account details on the website?', 'grace@mail.com'),
                ('Helen', 'The new cafe in town serves the best coffee. We should go sometime.', 'helen@mail.com'),
                ('Ian', 'I started a new painting class and it''s been so relaxing and fun!', 'ian@mail.com'),
                ('Julia', 'Can you help me with my project? I''m facing some issues with the code.', 'julia@mail.com');
        `;

        db.run(insertMessagesSQL, (error) => {
            if (error) {
                console.log("ERROR inserting messages: ", error);
            } else {
                console.log("---> Messages inserted!");
            }
        });
    }
});

/*----Projects----*/

db.run(`CREATE TABLE IF NOT EXISTS Projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    imageLink TEXT,
    alt TEXT,
    link TEXT,
    p2_firstWord TEXT,
    p2_secondWord TEXT,
    p2_thirdWord TEXT,
    p2_description TEXT,
    p2_downloadLink TEXT DEFAULT NULL,
    download_id INTEGER,
    FOREIGN KEY (download_id) REFERENCES Download(id)
)`, (error) => {
    if (error) {
        console.log("ERROR: ", error);
    } else {
        console.log("---> Table Projects created!");

        const insertAllProjectsSQL = `
            INSERT INTO Projects 
                (name, description, imageLink, alt, link, p2_firstWord, p2_secondWord, p2_thirdWord, p2_description) 
            VALUES 
                ('Tetris', 
                 'Crafted my first game, Tetris, using QT and C++. A monumental step in my programming journey. Score isn''t implemented but it''s working with a few "minor" bugs ehm.. features', 
                 'img/tetris.jpg', 
                 'Tetris game', 
                 '/project-description-1', 
                 'my', 
                 'TETRIS', 
                 'game', 
                 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Obcaecati ex laudantium ab placeat ea voluptas, veritatis pariatur non ipsam aperiam unde quasi deleniti laboriosam consequatur repudiandae, cumque natus eius nostrum odit recusandae. ...'),
                 
                ('Black-Jack', 
                 'Developed a dynamic Blackjack game, where players challenge a computer opponent. My second gaming creation.', 
                 'img/cards.jpg', 
                 'BlackJack game', 
                 '/project-description-2', 
                 'my', 
                 'Black-Jack', 
                 'game', 
                 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Obcaecati ex laudantium ab placeat ea voluptas, veritatis pariatur non ipsam aperiam unde quasi deleniti laboriosam consequatur repudiandae, cumque natus eius nostrum odit recusandae. Eos alias ex temporibus pariatur fugit perspiciatis porro similique consequuntur incidunt voluptatum ipsa rem blanditiis distinctio, quam quod veritatis pariatur non ipsam aperiam unde quasi deleniti laboriosam consequatur repudiandae?'),
                 
                ('Math-tool', 
                 'Crafted a C++ terminal tool during my Discrete Math course. It efficiently executes the Euclidean algorithm and aids in identifying inverses for encryption math.', 
                 'img/math.jpg', 
                 'Math Tool', 
                 '/project-description-3', 
                 'my', 
                 'MATH', 
                 'tool', 
                 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Obcaecati ex laudantium ab placeat ea voluptas, veritatis pariatur non ipsam aperiam unde quasi deleniti laboriosam consequatur repudiandae, cumque natus eius nostrum odit recusandae. Eos alias ex temporibus pariatur fugit perspiciatis porro similique consequuntur incidunt voluptatum ipsa rem blanditiis distinctio, quam quod veritatis pariatur non ipsam aperiam unde quasi deleniti laboriosam consequatur repudiandae?'),

                ('CSS Animation', 
                 'My inaugural web project showcases original CSS art crafted by me. It''s a work in progress - feel free to click the link and witness its evolution!', 
                 'img/website.jpg', 
                 'Globe and Web', 
                 '/project-description-4', 
                 'my', 
                 'CSS', 
                 'project', 
                 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Obcaecati ex laudantium ab placeat ea voluptas, veritatis pariatur non ipsam aperiam unde quasi deleniti laboriosam consequatur repudiandae, cumque natus eius nostrum odit recusandae. Eos alias ex temporibus pariatur fugit perspiciatis porro similique consequuntur incidunt voluptatum ipsa rem blanditiis distinctio, quam quod veritatis pariatur non ipsam aperiam unde quasi deleniti laboriosam consequatur repudiandae?'),
                 
                ('Visual-Sorting', 
                 'My early visual creation: an array of sorting algorithms on display, letting you visually experience the sorting process in action.', 
                 'img/sorting.png', 
                 'Graph sorted', 
                 '/project-description-5', 
                 'a', 
                 'VISUAL', 
                 'sorter', 
                 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Obcaecati ex laudantium ab placeat ea voluptas, veritatis pariatur non ipsam aperiam unde quasi deleniti laboriosam consequatur repudiandae, cumque natus eius nostrum odit recusandae. Eos alias ex temporibus pariatur fugit perspiciatis porro similique consequuntur incidunt voluptatum ipsa rem blanditiis distinctio, quam quod veritatis pariatur non ipsam aperiam unde quasi deleniti laboriosam consequatur repudiandae?')
        `;

        db.run(insertAllProjectsSQL, (error) => {
            if (error) {
                console.log("ERROR inserting projects: ", error);
            } else {
                console.log("---> Projects inserted!");
            }
        });
    }
});

//**************************************************************************** */
//*************************************Views********************************** */

db.run(`CREATE VIEW IF NOT EXISTS CommentViewWithAuthor AS
    SELECT
        c.id AS comment_id,
        c.post AS comment_post,
        u.username AS poster_name,
        c.created_at AS comment_timestamp,
        c.author_id AS author_id
    FROM
        Comments c
    JOIN
        User u ON c.poster = u.id;`, (error) => {
    if (error) {
        console.log("ERROR: ", error);
    } else {
        console.log("---> View CommentViewWithAuthor created!");
    }
});

db.run(`CREATE VIEW IF NOT EXISTS ProjectData AS
    SELECT
        id,
        name,
        description,
        imageLink,
        alt,
        link
    FROM
        Projects;`, (error) => {
    if (error) {
        console.log("ERROR: ", error);
    } else {
        console.log("---> View ProjectData created!");

        db.close((err) => {
            if (err) {
                console.error('Error closing the database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
});