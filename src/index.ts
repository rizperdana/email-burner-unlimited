import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { cache } from 'hono/cache'
import { html } from 'hono/html'

// Types
interface Env {
  EMAIL_BURNER_KV: KVNamespace
}

interface EmailAddress {
  address: string
  domain: string
  alias: string
  createdAt: number
}

interface EmailMessage {
  id: string
  from: string
  subject: string
  preview: string
  content: string
  receivedAt: number
  read: boolean
}

// e-mail.web.id platform constants
const PLATFORM_BASE = 'https://e-mail.web.id'
const AVAILABLE_DOMAINS = [
  'ahli.my.id', 'beritaotomatis.my.id', 'bosspulsa.my.id', 'cikidang.my.id',
  'diet.biz.id', 'dog.my.id', 'e-mail.web.id', 'eceran.my.id',
  'geminipress.my.id', 'getkeyword.my.id', 'gig.biz.id', 'gol.my.id',
  'hemodialisaplara.my.id', 'idm.my.id', 'juwana.my.id', 'kayen.my.id',
  'kos.web.id', 'missyou.my.id', 'mymoment.my.id', 'openbo.web.id',
  'pajagan.my.id', 'paticintadamai.my.id', 'screen.my.id', 'soqrisme.my.id',
  'sukolilo.my.id', 'tambakromo.my.id', 'tkpwarditimeline.my.id'
]

// Helper functions
function getCookie(headers: Headers): string | null {
  return headers.get('cookie')
}

function parseCookie(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [key, ...vals] = c.split('=')
      return [key, vals.join('=')]
    })
  )
}

function setCookie(value: string, options: { path?: string; maxAge?: number } = {}): string {
  let cookie = `PHPSESSID=${value}; path=${options.path || '/'}; SameSite=Lax`
  if (options.maxAge) cookie += `; Max-Age=${options.maxAge}; Secure`
  return cookie
}

// Create Hono app
const app = new Hono<{ Bindings: Env }>()

// CORS
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Cache middleware
app.use('/api/*', cache({
  cacheName: () => 'api-cache',
  maxAge: 30,
}))

// HTML UI Template
const UI_TEMPLATE = (body: string) => html`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Burner Unlimited</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      background: #0f0f0f;
      color: #e0e0e0;
      min-height: 100vh;
      line-height: 1.6;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1 {
      color: #00ff88;
      font-size: 2rem;
      margin-bottom: 0.5rem;
      letter-spacing: -1px;
    }
    h2 {
      color: #00ff88;
      font-size: 1.25rem;
      margin: 1.5rem 0 1rem;
      opacity: 0.8;
    }
    .subtitle {
      color: #666;
      margin-bottom: 2rem;
    }
    .card {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      color: #666;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }
    input, select, textarea {
      width: 100%;
      background: #0a0a0a;
      border: 1px solid #333;
      color: #e0e0e0;
      padding: 0.75rem;
      font-family: inherit;
      font-size: 1rem;
      border-radius: 4px;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #00ff88;
    }
    button {
      background: #00ff88;
      color: #000;
      border: none;
      padding: 0.75rem 1.5rem;
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      border-radius: 4px;
    }
    button:hover {
      opacity: 0.9;
    }
    button.secondary {
      background: transparent;
      color: #00ff88;
      border: 1px solid #00ff88;
    }
    .email-list {
      font-size: 0.875rem;
    }
    .email-item {
      padding: 0.75rem;
      background: #151515;
      border: 1px solid #2a2a2a;
      margin-bottom: 0.5rem;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .email-address {
      color: #00ff88;
    }
    .badge {
      background: #333;
      color: #999;
      padding: 0.25rem 0.5rem;
      font-size: 0.625rem;
      border-radius: 2px;
      margin-left: 0.5rem;
    }
    .endpoint {
      background: #151515;
      padding: 1rem;
      margin-bottom: 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }
    .method {
      display: inline-block;
      width: 60px;
      color: #00ff88;
      font-weight: 600;
    }
    .path {
      color: #e0e0e0;
    }
    .desc {
      color: #666;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    .nav {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .nav a {
      color: #666;
      text-decoration: none;
    }
    .nav a:hover, .nav a.active {
      color: #00ff88;
    }
    .error {
      background: #2a1515;
      border-color: #ff4444;
      color: #ff6666;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    .success {
      background: #152a15;
      border-color: #00ff88;
      color: #00ff88;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    code {
      background: #151515;
      padding: 0.125rem 0.375rem;
      border-radius: 2px;
      font-size: 0.875em;
    }
    pre {
      background: #151515;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <nav class="nav">
      <a href="/" class="active">Dashboard</a>
      <a href="/docs">API Docs</a>
    </nav>
    ${body}
  </div>
</body>
</html>
`

// Root UI
app.get('/', (c) => {
  return c.html(UI_TEMPLATE(`
    <h1>Email Burner Unlimited</h1>
    <p class="subtitle">API wrapper for e-mail.web.id burner email service</p>
    
    <div class="card">
      <h2>Quick Start</h2>
      <div class="form-group">
        <label>Login</label>
        <form method="POST" action="/api/auth/login">
          <input type="text" name="username" placeholder="Username" required>
          <input type="password" name="password" placeholder="Password" required style="margin-top: 0.5rem">
          <button type="submit" style="margin-top: 1rem">Login</button>
        </form>
      </div>
    </div>
    
    <div class="card">
      <h2>Available Domains (${AVAILABLE_DOMAINS.length})</h2>
      <div class="email-list">
        ${AVAILABLE_DOMAINS.slice(0, 10).map(d => `
          <div class="email-item">
            <span class="email-address">@${d}</span>
          </div>
        `).join('')}
        ${AVAILABLE_DOMAINS.length > 10 ? `<p class="badge">+${AVAILABLE_DOMAINS.length - 10} more</p>` : ''}
      </div>
    </div>
    
    <div class="card">
      <h2>Endpoints</h2>
      <div class="endpoint">
        <span class="method">POST</span> <span class="path">/api/auth/login</span>
        <div class="desc">Login with e-mail.web.id credentials</div>
      </div>
      <div class="endpoint">
        <span class="method">GET</span> <span class="path">/api/email/list</span>
        <div class="desc">List your burner emails</div>
      </div>
      <div class="endpoint">
        <span class="method">POST</span> <span class="path">/api/email/create</span>
        <div class="desc">Create new burner email</div>
      </div>
      <div class="endpoint">
        <span class="method">GET</span> <span class="path">/api/inbox/:address</span>
        <div class="desc">Get inbox for email address</div>
      </div>
    </div>
  `))
})

// API Docs
app.get('/docs', (c) => {
  return c.html(UI_TEMPLATE(`
    <h1>API Documentation</h1>
    <p class="subtitle">REST API endpoints</p>
    
    <div class="card">
      <h2>Authentication</h2>
      <div class="endpoint">
        <span class="method">POST</span> <span class="path">/api/auth/login</span>
        <div class="desc">Login to e-mail.web.id</div>
      </div>
      <pre>curl -X POST https://your-worker.workers.dev/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username": "your-user", "password": "your-pass"}'</pre>
    </div>
    
    <div class="card">
      <h2>Email Management</h2>
      <div class="endpoint">
        <span class="method">GET</span> <span class="path">/api/email/list</span>
        <div class="desc">List all created emails</div>
      </div>
      <div class="endpoint">
        <span class="method">POST</span> <span class="path">/api/email/create</span>
        <div class="desc">Create new email (optional: alias, domain)</div>
      </div>
      <pre>curl -X POST https://your-worker.workers.dev/api/email/create \\
  -H "Content-Type: application/json" \\
  -d '{"alias": "mycustom", "domain": "e-mail.web.id"}'</pre>
    </div>
    
    <div class="card">
      <h2>Inbox</h2>
      <div class="endpoint">
        <span class="method">GET</span> <span class="path">/api/inbox/:address</span>
        <div class="desc">Get inbox messages</div>
      </div>
      <div class="endpoint">
        <span class="method">GET</span> <span class="path">/api/inbox/:address/:id</span>
        <div class="desc">Get specific email</div>
      </div>
    </div>
  `))
})

// ========== API ROUTES ==========

// Login
app.post('/api/auth/login', async (c) => {
  const { username, password } = await c.req.json().catch(() => ({}))
  
  if (!username || !password) {
    return c.json({ error: 'Missing username or password' }, 400)
  }
  
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)
  
  try {
    const response = await fetch(`${PLATFORM_BASE}/login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': `PHPSESSID=${Date.now()}`,
      },
      body: formData.toString(),
    })
    
    const text = await response.text()
    
    if (text.includes('Login gagal') || text.includes('salah')) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    // Extract session from cookies
    const setCookie = response.headers.get('set-cookie') || ''
    const sessId = setCookie.match(/PHPSESSID=([^;]+)/)?.[1] || 'session'
    
    // Store session
    await c.env.EMAIL_BURNER_KV.put(`session:${username}`, sessId, { expirationTtl: 86400 })
    await c.env.EMAIL_BURNER_KV.put(`cred:${username}`, btoa(JSON.stringify({ username, password })), { expirationTtl: 86400 * 30 })
    
    return c.json({ 
      success: true, 
      message: 'Logged in successfully',
      username 
    })
  } catch (err) {
    return c.json({ error: 'Failed to connect to platform' }, 500)
  }
})

// Logout
app.post('/api/auth/logout', async (c) => {
  const auth = c.req.header('Authorization')
  const username = auth ? JSON.parse(atob(auth.split('.')[1] || '{}')).username : null
  
  if (username) {
    await c.env.EMAIL_BURNER_KV.delete(`session:${username}`)
    await c.env.EMAIL_BURNER_KV.delete(`cred:${username}`)
  }
  
  return c.json({ success: true, message: 'Logged out' })
})

// List domains
app.get('/api/domains', (c) => {
  return c.json({ domains: AVAILABLE_DOMAINS })
})

// Create email
app.post('/api/email/create', async (c) => {
  // In a real implementation, this would call the platform's internal API
  // For now, return mock response showing the concept
  
  const { alias, domain } = await c.req.json().catch(() => ({}))
  const selectedDomain = domain || AVAILABLE_DOMAINS[Math.floor(Math.random() * AVAILABLE_DOMAINS.length)]
  const selectedAlias = alias || `user${Date.now()}`
  const emailAddress = `${selectedAlias}@${selectedDomain}`
  
  // Store the email
  const emails = await c.env.EMAIL_BURNER_KV.get('emails', 'json') as EmailAddress[] || []
  emails.push({
    address: emailAddress,
    domain: selectedDomain,
    alias: selectedAlias,
    createdAt: Date.now()
  })
  await c.env.EMAIL_BURNER_KV.put('emails', JSON.stringify(emails))
  
  return c.json({
    success: true,
    email: emailAddress,
    alias: selectedAlias,
    domain: selectedDomain,
    createdAt: new Date().toISOString()
  })
})

// List emails
app.get('/api/email/list', async (c) => {
  const emails = await c.env.EMAIL_BURNER_KV.get('emails', 'json') as EmailAddress[] || []
  return c.json({ emails })
})

// Get inbox
app.get('/api/inbox/:address', async (c) => {
  const address = c.req.param('address')
  
  // Mock inbox response
  return c.json({
    address,
    messages: [],
    total: 0,
    unread: 0
  })
})

// Get specific email
app.get('/api/inbox/:address/:id', async (c) => {
  const { address, id } = c.req.params()
  
  return c.json({
    id,
    address,
    from: 'sender@example.com',
    subject: 'Subject',
    content: 'Content here...',
    receivedAt: Date.now()
  })
})

// Delete email
app.delete('/api/email/:address', async (c) => {
  const address = c.req.param('address')
  
  const emails = await c.env.EMAIL_BURNER_KV.get('emails', 'json') as EmailAddress[] || []
  const filtered = emails.filter(e => e.address !== address)
  await c.env.EMAIL_BURNER_KV.put('emails', JSON.stringify(filtered))
  
  return c.json({ success: true, message: `Deleted ${address}` })
})

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() })
})

export default app