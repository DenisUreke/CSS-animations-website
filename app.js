const express = require('express');
const { engine } = require('express-handlebars');

const app = express();
const port = 8080;

// Database setup
const sqlite3 = require('sqlite3').verbose();
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

// Routes
app.get('/', (request, response) => {
    response.render('home', { layout: 'adminLayout' });
});

app.get('/humans', (request, response) => {
    const model = { listHumans: humans };
    response.render('humans.handlebars', model);
});

app.get('/humans/1', (request, response) => {
    const model = humans[1];
    response.render('human.handlebars', {});
});

app.get('/forum/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Received request for forum with ID: ${id}`);

  // Query the database
  db.get('SELECT * FROM User WHERE id = ?', [id], (err, row) => {
      if (err) {
          console.error(`Error fetching data for ID: ${id}. Error: ${err.message}`);
          return res.status(500).json({ error: 'Server error' });
      }

      if (row) {
          console.log(`Successfully fetched data for ID: ${id}:`, row);
          return res.status(200).json(row);
      } else {
          console.warn(`No data found for ID: ${id}`);
          return res.status(404).json({ error: 'Not found' });
      }
  });
})

// 404 route
app.use((req, res) => {
    res.status(404).render('404.handlebars');
});

// Server start
app.listen(port, () => {
    console.log(`Server running and listening on port ${port}...`);
});

// CONTROLLER (THE BOSS)
// defines route "/"
/*app.get('/', function(request, response){
  response.render('layouts/adminLayout.handlebars')
}) ***/
