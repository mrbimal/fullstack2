import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.resolve('./server/db.json');

function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { videos: [], editorContent: '' };
  }
}

function writeDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

app.get('/api/videos', (req, res) => {
  const db = readDB();
  res.json(db.videos || []);
});

app.post('/api/videos', (req, res) => {
  const db = readDB();
  const item = { ...req.body, id: req.body.id || `${Date.now()}` };
  db.videos = [item, ...(db.videos || [])];
  writeDB(db);
  res.status(201).json(item);
});

app.put('/api/videos/:id', (req, res) => {
  const db = readDB();
  const id = req.params.id;
  db.videos = (db.videos || []).map((v) => (v.id === id ? { ...v, ...req.body } : v));
  writeDB(db);
  const updated = db.videos.find((v) => v.id === id);
  res.json(updated || {});
});

app.delete('/api/videos/:id', (req, res) => {
  const db = readDB();
  const id = req.params.id;
  db.videos = (db.videos || []).filter((v) => v.id !== id);
  writeDB(db);
  res.status(204).end();
});

app.get('/api/editor', (req, res) => {
  const db = readDB();
  res.json({ content: db.editorContent || '' });
});

app.post('/api/editor', (req, res) => {
  const db = readDB();
  db.editorContent = req.body.content || '';
  writeDB(db);
  res.status(200).json({ content: db.editorContent });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});
