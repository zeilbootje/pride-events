const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 🔌 Verbind met je MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Reidinga14!SQL', // ← vervang dit!
  database: 'pridetestDB'     // ← vervang dit met jouw database naam
});

db.connect(err => {
  if (err) {
    console.error('Database verbinding mislukt:', err);
  } else {
    console.log('✅ Verbonden met MySQL database!');
  }
});

// 🚀 API route: haal alle events + hun tags op
app.get('/events', (req, res) => {
const query = `
  SELECT 
    evenementen.evenement_id, 
    evenementen.name AS evenement_name, 
    GROUP_CONCAT(tags.name) AS tags 
  FROM evenementen
  JOIN evenementen_tags ON evenementen.evenement_id = evenementen_tags.evenement_id
  JOIN tags ON evenementen_tags.tag_id = tags.tag_id
  GROUP BY evenementen.evenement_id
`;


  db.query(query, (err, results) => {
    if (err) {
      console.error('Query fout:', err);
      res.status(500).json({ error: 'Database fout' });
    } else {
      // splits de tags string in array
      const formatted = results.map(row => ({
        id: row.evenement_id,
        name: row.evenement_name,
        tags: row.tags.split(',')
      }));
      res.json(formatted);
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server draait op http://localhost:${PORT}`);
});
