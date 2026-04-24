# Burner Email Wrapper - Specification

## Project Overview

- **Name**: Email Burner Unlimited API
- **Type**: Cloudflare Worker with REST API + UI
- **Core Functionality**: Wrapper around e-mail.web.id burner email service
- **Target Users**: Developers needing disposable email addresses

## Platform Analysis (e-mail.web.id)

### Features
- Unlimited burner email creation
- 27 available domains: ahli.my.id, beritaotomatis.my.id, bosspulsa.my.id, cikidang.my.id, diet.biz.id, dog.my.id, e-mail.web.id, eceran.my.id, geminipress.my.id, getkeyword.my.id, gig.biz.id, gol.my.id, hemodialisaplara.my.id, idm.my.id, juwana.my.id, kayen.my.id, kos.web.id, missyou.my.id, mymoment.my.id, openbo.web.id, pajagan.my.id, paticintadamai.my.id, screen.my.id, soqrisme.my.id, sukolilo.my.id, tambakromo.my.id, tkpwarditimeline.my.id
- Auto-delete after 7 days
- Anti-spam features
- 100% Free (donations accepted)

### Authentication Flow
1. POST to `/login.php` with `username` and `password`
2. Session cookie returned for authenticated requests
3. Dashboard accessible for email management

### Core API Operations
1. **Login**: Authenticate with credentials
2. **Create Email**: Generate new burner email address
3. **List Emails**: Get all created emails
4. **Get Inbox**: Fetch emails for specific address
5. **Get Email Details**: Read specific email content

## Architecture

### Components
1. **Cloudflare Worker**: Main API server
2. **KV Storage**: Store session tokens, email cache
3. **HTML UI**: Minimal dashboard for web access

### API Endpoints

| Method | Endpoint | Description |
|-------|----------|-------------|
| POST | /api/auth/login | Login to e-mail.web.id |
| POST | /api/auth/logout | Logout |
| GET | /api/email/list | List your burner emails |
| POST | /api/email/create | Create new burner email |
| GET | /api/inbox/{email} | Get inbox for email address |
| GET | /api/inbox/{email}/{id} | Get specific email |
| DELETE | /api/email/{email} | Delete email address |
| GET | /api/domains | List available domains |

### UI Pages

| Route | Description |
|------|-------------|
| / | Main dashboard UI |
| /api-docs | API documentation |

## Functionality Specification

### 1. Authentication
- Store credentials securely in KV
- Auto-refresh session when expired
- Support multiple accounts

### 2. Email Creation
- Select domain from available list
- Custom alias or auto-generate
- Return full email address

### 3. Email Reading
- Poll inbox for new emails
- Parse email content (HTML/Text)
- Support attachments (links only)

### 4. Caching
- Cache inbox for 30 seconds
- Cache email list for 60 seconds

## Technical Implementation

### Dependencies
- Cloudflare Workers (runtime)
- @cloudflare/workers-types (TypeScript)

### Project Structure
```
/src
  /handlers
    - auth.ts      # Authentication handlers
    - email.ts     # Email management
    - inbox.ts     # Inbox reading
    - ui.ts        # HTML UI pages
  /lib
    - client.ts    # e-mail.web.id HTTP client
    - config.ts   # Configuration
    - storage.ts  # KV storage utilities
  /types
    - index.ts    # TypeScript types
  index.ts        # Main entry point
wrangler.toml    # Cloudflare config
package.json     # Dependencies
tsconfig.json    # TypeScript config
```

## UI/UX Specification

### Design
- Minimal dark theme
- Clean card-based layout
- Monospace fonts for emails
- Responsive design

### Color Palette
- Background: #0f0f0f
- Card: #1a1a1a
- Primary: #00ff88 (green)
- Text: #e0e0e0
- Muted: #666666

### Components
- Email list cards with domain badges
- Inbox table with sender/subject/preview
- Email detail view with full content

## Deployment

### GitHub Repository
- Owner: User's GitHub account
- Name: email-burner-unlimited
- Visibility: Public

### Cloudflare Workers
- Name: email-burner-api
- Domain: email-burner-api.*.workers.dev

## Security Considerations

- Credentials stored in KV (encrypted at rest)
- Rate limiting on all endpoints
- CORS configured for authorized origins
- No sensitive data in logs

## Acceptance Criteria

- [ ] User can login with e-mail.web.id credentials
- [ ] User can create unlimited burner emails
- [ ] User can view inbox for any created email
- [ ] User can read full email content
- [ ] API accessible via REST endpoints
- [ ] UI accessible via web browser
- [ ] Deployed to Cloudflare Workers
- [ ] GitHub repo created with code

## Notes

- Platform credentials provided by user may need verification
- CAPTCHA may block automated registration
- Platform rate limits may apply