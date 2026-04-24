# Email Burner Unlimited

API wrapper for e-mail.web.id burner email service using Playwright for browser automation.

## Features

- REST API for burner email management
- Web UI dashboard
- Create unlimited burner email addresses
- Read received emails
- 27 available domains

## Quick Start

### Installation

```bash
npm install
```

### Run

```bash
npm start
```

Server runs on http://localhost:3000

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## API Usage

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "your-user", "password": "your-pass"}'
```

### Create Email

```bash
curl -X POST http://localhost:3000/api/email/create \
  -H "Content-Type: application/json" \
  -d '{"alias": "mycustom", "domain": "e-mail.web.id"}'
```

### List Emails

```bash
curl http://localhost:3000/api/email/list
```

### Get Inbox

```bash
curl http://localhost:3000/api/inbox/test@e-mail.web.id
```

## API Endpoints

| Method | Endpoint | Description |
|-------|----------|-------------|
| POST | /api/auth/login | Login to platform |
| POST | /api/auth/logout | Logout |
| GET | /api/email/list | List emails |
| POST | /api/email/create | Create email |
| GET | /api/inbox/:address | Get inbox |

## UI

Open http://localhost:3000 for web dashboard.

## Available Domains

- ahli.my.id
- beritaotomatis.my.id
- bosspulsa.my.id
- cikidang.my.id
- diet.biz.id
- dog.my.id
- e-mail.web.id
- eceran.my.id
- geminipress.my.id
- getkeyword.my.id
- gig.biz.id
- gol.my.id
- hemodialisaplara.my.id
- idm.my.id
- juwana.my.id
- kayen.my.id
- kos.web.id
- missyou.my.id
- mymoment.my.id
- openbo.web.id
- pajagan.my.id
- paticintadamai.my.id
- screen.my.id
- soqrisme.my.id
- sukolilo.my.id
- tambakromo.my.id
- tkpwarditimeline.my.id

## Deployment

### Railway/Render (Node.js)

```bash
npm install
npm start
```

### Cloudflare Workers

This project uses Playwright which requires Node.js. For Cloudflare Workers deployment, consider using the Workers HTTP API with an external headless browser service.

## License

MIT