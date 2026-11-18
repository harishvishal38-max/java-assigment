/**
 * ComplaintHub HTTP & SQLite Database Server
 * Uses Node.js native http, fs, path, and node:sqlite (Node 22+)
 * Database File: d:\JAVA\complaints.db
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DB_PATH = path.join(__dirname, 'complaints.db');

// ==========================================
// 1. SQLITE DATABASE INITIALIZATION
// ==========================================
const db = new DatabaseSync(DB_PATH);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY,
    customer_name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL,
    date_filed TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'REGISTERED',
    remarks TEXT DEFAULT 'Awaiting review'
  );
`);

// Seed function
function seedDatabase() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    console.log('Seeding initial users to SQLite...');
    const insertUser = db.prepare('INSERT INTO users (name, password, role) VALUES (?, ?, ?)');
    insertUser.run('admin', 'admin123', 'ADMIN');
    insertUser.run('dinesh', 'dinesh123', 'CUSTOMER');
    insertUser.run('ram', 'ram123', 'CUSTOMER');
    insertUser.run('sita', 'sita123', 'CUSTOMER');
    insertUser.run('priya', 'priya123', 'CUSTOMER');
    insertUser.run('raj', 'raj123', 'CUSTOMER');
  }

  const compCount = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;
  if (compCount === 0) {
    console.log('Seeding initial complaints to SQLite...');
    const insertComp = db.prepare(`
      INSERT INTO complaints (id, customer_name, category, description, priority, date_filed, status, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertComp.run(1001, 'dinesh', 'Service', 'Internet connection is down since two days', 'HIGH', '2026-11-09', 'IN_PROGRESS', 'Technician assigned');
    insertComp.run(1002, 'ram', 'Billing', 'Charged twice for monthly bill', 'MEDIUM', '2026-11-09', 'RESOLVED', 'Refund processed');
    insertComp.run(1003, 'sita', 'Product', 'Received a damaged product', 'LOW', '2026-11-09', 'IN_PROGRESS', 'Replacement being arranged');
    insertComp.run(1004, 'priya', 'Service', 'Mobile network signal is very weak', 'MEDIUM', '2026-11-09', 'REGISTERED', 'Awaiting review');
    insertComp.run(1005, 'raj', 'Other', 'Unable to update address in profile', 'LOW', '2026-11-09', 'REGISTERED', 'Awaiting review');
  }
}

seedDatabase();

// ==========================================
// 2. MIME TYPES
// ==========================================
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.java': 'text/plain; charset=utf-8',
  '.sql': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

// Helper: parse JSON request body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// ==========================================
// 3. HTTP SERVER & API ROUTES
// ==========================================
const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split('?');
  const pathname = urlParts[0];

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // --- API: Database Status ---
  if (pathname === '/api/db-status' && req.method === 'GET') {
    const compCount = db.prepare('SELECT COUNT(*) as c FROM complaints').get().c;
    const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
    return sendJson(res, 200, {
      engine: 'SQLite 3 (Embedded via node:sqlite)',
      databaseFile: DB_PATH,
      connected: true,
      complaintRecords: compCount,
      userRecords: userCount
    });
  }

  // --- API: Get All Complaints ---
  if (pathname === '/api/complaints' && req.method === 'GET') {
    const rows = db.prepare('SELECT id, customer_name as customerName, category, description, priority, date_filed as dateFiled, status, remarks FROM complaints ORDER BY id DESC').all();
    return sendJson(res, 200, rows);
  }

  // --- API: Get Single Complaint by ID ---
  const compIdMatch = pathname.match(/^\/api\/complaints\/(\d+)$/);
  if (compIdMatch && req.method === 'GET') {
    const id = parseInt(compIdMatch[1]);
    const row = db.prepare('SELECT id, customer_name as customerName, category, description, priority, date_filed as dateFiled, status, remarks FROM complaints WHERE id = ?').get(id);
    if (!row) {
      return sendJson(res, 404, { error: `No complaint found with ID: ${id}` });
    }
    return sendJson(res, 200, row);
  }

  // --- API: Register New Complaint ---
  if (pathname === '/api/complaints' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      if (!data.customerName || !data.category || !data.description) {
        return sendJson(res, 400, { error: 'Customer name, category, and description are required.' });
      }

      // Compute next ID (>= 1001)
      const maxRow = db.prepare('SELECT MAX(id) as maxId FROM complaints').get();
      const nextId = Math.max(1000, maxRow.maxId || 1000) + 1;
      const dateFiled = new Date().toISOString().split('T')[0];
      const priority = (data.priority || 'MEDIUM').toUpperCase();
      const status = 'REGISTERED';
      const remarks = 'Awaiting review';

      db.prepare(`
        INSERT INTO complaints (id, customer_name, category, description, priority, date_filed, status, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(nextId, data.customerName, data.category, data.description, priority, dateFiled, status, remarks);

      const created = db.prepare('SELECT id, customer_name as customerName, category, description, priority, date_filed as dateFiled, status, remarks FROM complaints WHERE id = ?').get(nextId);
      console.log(`[SQLite] New Complaint Registered: ID #${nextId} by ${data.customerName}`);
      return sendJson(res, 201, created);
    } catch (e) {
      return sendJson(res, 500, { error: e.message });
    }
  }

  // --- API: Update Complaint Status & Remarks ---
  if (compIdMatch && req.method === 'PATCH') {
    try {
      const id = parseInt(compIdMatch[1]);
      const data = await parseJsonBody(req);
      const existing = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
      if (!existing) {
        return sendJson(res, 404, { error: `No complaint found with ID: ${id}` });
      }

      const newStatus = data.status || existing.status;
      const newRemarks = data.remarks !== undefined ? data.remarks : existing.remarks;

      db.prepare('UPDATE complaints SET status = ?, remarks = ? WHERE id = ?').run(newStatus, newRemarks, id);
      const updated = db.prepare('SELECT id, customer_name as customerName, category, description, priority, date_filed as dateFiled, status, remarks FROM complaints WHERE id = ?').get(id);
      console.log(`[SQLite] Complaint #${id} updated: Status=${newStatus}`);
      return sendJson(res, 200, updated);
    } catch (e) {
      return sendJson(res, 500, { error: e.message });
    }
  }

  // --- API: Login User ---
  if (pathname === '/api/login' && req.method === 'POST') {
    try {
      const { name, password } = await parseJsonBody(req);
      const user = db.prepare('SELECT id, name, role FROM users WHERE LOWER(name) = LOWER(?) AND password = ?').get(name, password);
      if (!user) {
        return sendJson(res, 401, { error: 'Invalid credentials.' });
      }
      return sendJson(res, 200, user);
    } catch (e) {
      return sendJson(res, 500, { error: e.message });
    }
  }

  // --- API: Register New User ---
  if (pathname === '/api/register' && req.method === 'POST') {
    try {
      const { name, password } = await parseJsonBody(req);
      if (!name || !password) {
        return sendJson(res, 400, { error: 'Username and password required.' });
      }
      const existing = db.prepare('SELECT id FROM users WHERE LOWER(name) = LOWER(?)').get(name);
      if (existing) {
        return sendJson(res, 400, { error: `User "${name}" already exists.` });
      }
      db.prepare('INSERT INTO users (name, password, role) VALUES (?, ?, ?)').run(name, password, 'CUSTOMER');
      console.log(`[SQLite] Registered new customer: ${name}`);
      return sendJson(res, 201, { name, role: 'CUSTOMER' });
    } catch (e) {
      return sendJson(res, 500, { error: e.message });
    }
  }

  // --- API: Statistics ---
  if (pathname === '/api/stats' && req.method === 'GET') {
    const total = db.prepare('SELECT COUNT(*) as c FROM complaints').get().c;
    const registered = db.prepare("SELECT COUNT(*) as c FROM complaints WHERE status = 'REGISTERED'").get().c;
    const inProgress = db.prepare("SELECT COUNT(*) as c FROM complaints WHERE status = 'IN_PROGRESS'").get().c;
    const resolved = db.prepare("SELECT COUNT(*) as c FROM complaints WHERE status = 'RESOLVED'").get().c;
    return sendJson(res, 200, { total, registered, inProgress, resolved });
  }

  // --- API: Reset Database to Default PDF Data ---
  if (pathname === '/api/reset' && req.method === 'POST') {
    db.exec('DELETE FROM complaints; DELETE FROM users;');
    seedDatabase();
    return sendJson(res, 200, { message: 'Database reset to initial demo data successfully.' });
  }

  // ==========================================
  // 4. STATIC FILE SERVING
  // ==========================================
  let safeUrl = pathname;
  if (safeUrl === '/' || safeUrl === '') {
    safeUrl = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safeUrl);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(` ComplaintHub Server running at: http://localhost:${PORT}`);
  console.log(` Database: SQLite connected (complaints.db)`);
  console.log(` REST API: Active at http://localhost:${PORT}/api/complaints`);
  console.log(`================================================================`);
});
