import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import cors from 'cors';

// ============================================================================
// Configuration
// ============================================================================
const app = express();
const PORT = 3000;
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const GALLERY_DATA_PATH = path.join(process.cwd(), 'data', 'galleryData.json');
const TEAM_DATA_PATH = path.join(process.cwd(), 'data', 'teamData.json');
const FEATURED_SESSIONS_DATA_PATH = path.join(process.cwd(), 'data', 'featuredSessionsData.json');

// Ensure required directories exist
fs.ensureDirSync(UPLOADS_DIR);
fs.ensureDirSync(path.dirname(GALLERY_DATA_PATH));

// ============================================================================
// Middleware
// ============================================================================
app.use(cors());
app.use(express.json());

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generic function to read JSON data from a file.
 */
async function readJsonData(filePath: string) {
  try {
    if (await fs.pathExists(filePath)) {
      return await fs.readJson(filePath);
    }
    return [];
  } catch (error) {
    console.error(`Error reading data from ${filePath}:`, error);
    return [];
  }
}

/**
 * Generic function to write JSON data to a file.
 */
async function writeJsonData(filePath: string, data: any[]) {
  try {
    await fs.writeJson(filePath, data, { spaces: 2 });
  } catch (error) {
    console.error(`Error writing data to ${filePath}:`, error);
  }
}

// ============================================================================
// API Routes
// ============================================================================

/**
 * POST /api/upload
 * Uploads a single file to the server.
 */
app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the URL path relative to the public directory
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename });
});

/**
 * GET /api/media
 * Lists all uploaded media files.
 */
app.get('/api/media', async (req: Request, res: Response) => {
  try {
    const files = await fs.readdir(UPLOADS_DIR);
    const mediaFiles = files.filter(file => !file.startsWith('.')); // Filter hidden files
    const mediaList = mediaFiles.map(file => ({
      url: `/uploads/${file}`,
      filename: file,
      uploadedAt: fs.statSync(path.join(UPLOADS_DIR, file)).birthtime
    }));
    res.json(mediaList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list media' });
  }
});

/**
 * DELETE /api/media/:filename
 * Deletes a specific media file.
 */
app.delete('/api/media/:filename', async (req: Request, res: Response) => {
  const filename = req.params.filename as string;
  const filePath = path.join(UPLOADS_DIR, filename);
  
  try {
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// --- Gallery Routes ---

app.get('/api/gallery', async (req: Request, res: Response) => {
  const data = await readJsonData(GALLERY_DATA_PATH);
  res.json(data);
});

app.post('/api/gallery', async (req: Request, res: Response) => {
  const newItem = req.body;
  const data = await readJsonData(GALLERY_DATA_PATH);
  const newId = data.length > 0 ? Math.max(...data.map((item: any) => item.id)) + 1 : 1;
  const itemWithId = { ...newItem, id: newId };
  data.push(itemWithId);
  await writeJsonData(GALLERY_DATA_PATH, data);
  res.json(itemWithId);
});

app.put('/api/gallery/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const updatedItem = req.body;
  const data = await readJsonData(GALLERY_DATA_PATH);
  const index = data.findIndex((item: any) => item.id === id);
  if (index !== -1) {
    data[index] = { ...data[index], ...updatedItem, id };
    await writeJsonData(GALLERY_DATA_PATH, data);
    res.json(data[index]);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

app.delete('/api/gallery/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  let data = await readJsonData(GALLERY_DATA_PATH);
  const initialLength = data.length;
  data = data.filter((item: any) => item.id !== id);
  if (data.length !== initialLength) {
    await writeJsonData(GALLERY_DATA_PATH, data);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

// --- Featured Sessions Routes ---

app.get('/api/featured-sessions', async (req: Request, res: Response) => {
  const data = await readJsonData(FEATURED_SESSIONS_DATA_PATH);
  res.json(data);
});

app.post('/api/featured-sessions', async (req: Request, res: Response) => {
  const newItem = req.body;
  const data = await readJsonData(FEATURED_SESSIONS_DATA_PATH);
  const newId = Date.now();
  const itemWithId = { ...newItem, id: newId };
  data.push(itemWithId);
  await writeJsonData(FEATURED_SESSIONS_DATA_PATH, data);
  res.json(itemWithId);
});

app.put('/api/featured-sessions/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const updatedItem = req.body;
  const data = await readJsonData(FEATURED_SESSIONS_DATA_PATH);
  const index = data.findIndex((item: any) => item.id === id);
  if (index !== -1) {
    data[index] = { ...data[index], ...updatedItem, id };
    await writeJsonData(FEATURED_SESSIONS_DATA_PATH, data);
    res.json(data[index]);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

app.put('/api/featured-sessions', async (req: Request, res: Response) => {
    // Bulk update for reordering
    const items = req.body;
    if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Expected an array of items' });
    }
    await writeJsonData(FEATURED_SESSIONS_DATA_PATH, items);
    res.json({ success: true });
});

app.delete('/api/featured-sessions/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  let data = await readJsonData(FEATURED_SESSIONS_DATA_PATH);
  const initialLength = data.length;
  data = data.filter((item: any) => item.id !== id);
  if (data.length !== initialLength) {
    await writeJsonData(FEATURED_SESSIONS_DATA_PATH, data);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

// ============================================================================
// Server Initialization
// ============================================================================

// Serve static files from public directory explicitly (for production or fallback)
app.use(express.static('public'));

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In development: Use Vite middleware for HMR and serving
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production: Serve built assets from dist
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
