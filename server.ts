import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";

const DB_PATH = path.join(process.cwd(), 'src', 'db', 'data.json');

async function getDb() {
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

async function saveDb(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Generic API for all collections
  app.get('/api/:collection', async (req, res) => {
    try {
      const db = await getDb();
      const col = db[req.params.collection];
      if (!col) return res.status(404).json({ error: "Collection not found" });
      
      // If result is an object, return it directly
      if (!Array.isArray(col)) {
        return res.json(col);
      }
      
      // Basic filtering support for arrays
      let results = [...col];
      Object.keys(req.query).forEach(key => {
        if (key === 'limit') return;
        results = results.filter(item => String(item[key]) === String(req.query[key]));
      });

      if (req.query.limit) {
        results = results.slice(0, Number(req.query.limit));
      }

      res.json(results);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Special route for site settings
  app.put('/api/settings/system', async (req, res) => {
    try {
      const db = await getDb();
      db.settings.system = { ...db.settings.system, ...req.body };
      await saveDb(db);
      res.json(db.settings.system);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Special route for site config
  app.put('/api/site_config', async (req, res) => {
    try {
      const db = await getDb();
      db.site_config = { ...db.site_config, ...req.body };
      await saveDb(db);
      res.json(db.site_config);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get('/api/:collection/:id', async (req, res) => {
    try {
      const db = await getDb();
      const col = db[req.params.collection];
      if (!col) return res.status(404).json({ error: "Collection not found" });
      const item = col.find((i: any) => i.id === req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found" });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/:collection', async (req, res) => {
    try {
      const db = await getDb();
      const col = db[req.params.collection];
      if (!col) return res.status(404).json({ error: "Collection not found" });
      
      const newItem = { 
        id: Math.random().toString(36).substring(2, 10), 
        createdAt: new Date().toISOString(),
        ...req.body 
      };
      col.push(newItem);
      await saveDb(db);
      res.json(newItem);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.put('/api/:collection/:id', async (req, res) => {
    try {
      const db = await getDb();
      const col = db[req.params.collection];
      if (!col) return res.status(404).json({ error: "Collection not found" });
      
      const idx = col.findIndex((i: any) => i.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: "Item not found" });
      
      col[idx] = { ...col[idx], ...req.body, updatedAt: new Date().toISOString() };
      await saveDb(db);
      res.json(col[idx]);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.delete('/api/:collection/:id', async (req, res) => {
    try {
      const db = await getDb();
      const col = db[req.params.collection];
      if (!col) return res.status(404).json({ error: "Collection not found" });
      
      const idx = col.findIndex((i: any) => i.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: "Item not found" });
      
      col.splice(idx, 1);
      await saveDb(db);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving with SPA fallback
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
