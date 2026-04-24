/**
 * Email Burner Unlimited - API Server
 * Wrapper for e-mail.web.id burner email service
 */

import express from 'express';
import { chromium } from 'playwright';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Platform constants
const PLATFORM_URL = 'https://e-mail.web.id';
const AVAILABLE_DOMAINS = [
  'ahli.my.id', 'beritaotomatis.my.id', 'bosspulsa.my.id', 'cikidang.my.id',
  'diet.biz.id', 'dog.my.id', 'e-mail.web.id', 'eceran.my.id',
  'geminipress.my.id', 'getkeyword.my.id', 'gig.biz.id', 'gol.my.id',
  'hemodialisaplara.my.id', 'idm.my.id', 'juwana.my.id', 'kayen.my.id',
  'kos.web.id', 'missyou.my.id', 'mymoment.my.id', 'openbo.web.id',
  'pajagan.my.id', 'paticintadamai.my.id', 'screen.my.id', 'soqrisme.my.id',
  'sukolilo.my.id', 'tambakromo.my.id', 'tkpwarditimeline.my.id'
];

// In-memory session store
let browser = null;
let page = null;
let isLoggedIn = false;

// Initialize browser
async function initBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    page = await context.newPage();
    console.log('Browser initialized');
  }
  return { browser, page };
}

// Login to e-mail.web.id
async function login(username, password) {
  const { page } = await initBrowser();
  
  await page.goto(`${PLATFORM_URL}/login.php`);
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  
  // Check for login error
  const error = await page.$('.alert-danger');
  if (error) {
    const text = await error.textContent();
    if (text?.includes('salah')) {
      throw new Error('Invalid credentials');
    }
  }
  
  isLoggedIn = true;
  return { success: true, username };
}

// Create new burner email
async function createEmail(alias, domain) {
  const { page } = await initBrowser();
  
  if (!isLoggedIn) {
    throw new Error('Not logged in');
  }
  
  await page.goto(`${PLATFORM_URL}/dashboard.php`);
  await page.click('text=Tambah Email');
  await page.waitForSelector('input[name="alias"]');
  
  await page.fill('input[name="alias"]', alias);
  await page.selectOption('select[name="domain"]', domain);
  await page.click('text=Tambah Sekarang');
  await page.waitForLoadState('networkidle');
  
  const email = `${alias}@${domain}`;
  return { success: true, email, alias, domain };
}

// Get list of created emails
async function listEmails() {
  const { page } = await initBrowser();
  
  if (!isLoggedIn) {
    throw new Error('Not logged in');
  }
  
  await page.goto(`${PLATFORM_URL}/dashboard.php`);
  await page.waitForSelector('table');
  
  const rows = await page.$$('table tbody tr');
  const emails = [];
  
  for (const row of rows) {
    const cells = await row.$$('td');
    if (cells.length >= 2) {
      const emailCell = await cells[0].textContent();
      emails.push({ address: emailCell?.trim() });
    }
  }
  
  return emails;
}

// Get inbox for an email address
async function getInbox(emailAddress) {
  const { page } = await initBrowser();
  
  if (!isLoggedIn) {
    throw new Error('Not logged in');
  }
  
  await page.goto(`${PLATFORM_URL}/inbox.php?email=${encodeURIComponent(emailAddress)}`);
  await page.waitForLoadState('networkidle');
  
  const messages = [];
  const rows = await page.$$('table tbody tr');
  
  for (const row of rows) {
    const cells = await row.$$('td');
    if (cells.length >= 3) {
      const from = await cells[0].textContent();
      const subject = await cells[1].textContent();
      const date = await cells[2].textContent();
      messages.push({ from, subject, date });
    }
  }
  
  return { address: emailAddress, messages };
}

// ========== API ROUTES ==========

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List available domains
app.get('/api/domains', (req, res) => {
  res.json({ domains: AVAILABLE_DOMAINS });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }
    
    const result = await login(username, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// Logout
app.post('/api/auth/logout', async (req, res) => {
  isLoggedIn = false;
  res.json({ success: true, message: 'Logged out' });
});

// Create email
app.post('/api/email/create', async (req, res) => {
  try {
    const { alias, domain } = req.body;
    if (!alias) {
      return res.status(400).json({ error: 'Missing alias' });
    }
    
    const selectedDomain = domain || 'e-mail.web.id';
    const result = await createEmail(alias, selectedDomain);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List emails
app.get('/api/email/list', async (req, res) => {
  try {
    const emails = await listEmails();
    res.json({ emails });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get inbox
app.get('/api/inbox/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const inbox = await getInbox(address);
    res.json(inbox);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HTML UI
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Email Burner Unlimited</title>
  <style>
    body { font-family: monospace; background: #0f0f0f; color: #e0e0e0; padding: 2rem; }
    h1 { color: #00ff88; }
    .card { background: #1a1a1a; padding: 1.5rem; border-radius: 8px; margin: 1rem 0; }
    input, select, button { padding: 0.75rem; margin: 0.5rem 0; width: 100%; max-width: 300px; }
    button { background: #00ff88; border: none; cursor: pointer; font-weight: bold; }
    .endpoint { background: #151515; padding: 0.75rem; margin: 0.5rem 0; }
    .method { color: #00ff88; font-weight: bold; }
    .badge { background: #333; padding: 0.25rem 0.5rem; font-size: 0.75rem; }
  </style>
</head>
<body>
  <h1>Email Burner Unlimited</h1>
  <p>API wrapper for e-mail.web.id</p>
  
  <div class="card">
    <h3>Login</h3>
    <form method="POST" action="/api/auth/login">
      <input name="username" placeholder="Username" required>
      <input name="password" type="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
  </div>
  
  <div class="card">
    <h3>Create Email</h3>
    <form method="POST" action="/api/email/create">
      <input name="alias" placeholder="Alias" required>
      <select name="domain">
        ${AVAILABLE_DOMAINS.map(d => `<option value="${d}">@${d}</option>`).join('')}
      </select>
      <button type="submit">Create Email</button>
    </form>
  </div>
  
  <div class="card">
    <h3>API Endpoints</h3>
    <div class="endpoint"><span class="method">POST</span> /api/auth/login</div>
    <div class="endpoint"><span class="method">GET</span> /api/email/list</div>
    <div class="endpoint"><span class="method">POST</span> /api/email/create</div>
    <div class="endpoint"><span class="method">GET</span> /api/inbox/:address</div>
  </div>
</body>
</html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;