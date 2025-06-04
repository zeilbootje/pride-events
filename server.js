const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Statische frontend bestanden serveren uit /public
app.use(express.static(path.join(__dirname, 'public')));

// Root route serveert index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Optioneel: 404 voor niet-bestaande bestanden
app.use((req, res, next) => {
  res.status(404).send('404 Not Found');
});

// 🔌 Verbind met PostgreSQL database via Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 🚀 Test connectie
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Database verbinding mislukt:', err.stack);
  }
  console.log('✅ Verbonden met PostgreSQL database!');
  release();
});

// 📦 API route: haal evenementen op met tags
app.get('/events', async (req, res) => {
  const query = `
    SELECT 
      evenementen.evenement_id, 
      evenementen.name AS evenement_name, 
      STRING_AGG(tags.name, ',') AS tags
    FROM evenementen
    JOIN evenementen_tags ON evenementen.evenement_id = evenementen_tags.evenement_id
    JOIN tags ON evenementen_tags.tag_id = tags.tag_id
    GROUP BY evenementen.evenement_id
  `;

  try {
    const result = await pool.query(query);
    const formatted = result.rows.map(row => ({
      id: row.evenement_id,
      name: row.evenement_name,
      tags: row.tags.split(',')
    }));
    res.json(formatted);
  } catch (err) {
    console.error('❌ Query fout:', err);
    res.status(500).json({ error: 'Database fout' });
  }
});

console.log('Luister op poort:', PORT);
app.listen(PORT, () => {
  console.log(`🚀 Server draait op http://localhost:${PORT}`);
});

