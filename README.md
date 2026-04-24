# Email Burner Unlimited

Cloudflare Worker wrapper for e-mail.web.id burner email service.

## Features

- REST API for burner email management
- Web UI dashboard
- Create unlimited burner email addresses
- Read received emails
- 27 available domains

## Quick Start

### Deploy to Cloudflare Workers

```bash
# Install dependencies
npm install

# Deploy
npm run deploy
```

### Configuration

1. Create a KV namespace in Cloudflare Workers:
```bash
wrangler kv:namespace create EMAIL_BURNER_KV
```

2. Update `wrangler.toml` with your KV namespace ID

## API Usage

### Login
```bash
curl -X POST https://your-worker.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "your-user", "password": "your-pass"}'
```

### Create Email
```bash
curl -X POST https://your-worker.workers.dev/api/email/create \
  -H "Content-Type: application/json" \
  -d '{"alias": "mycustom", "domain": "e-mail.web.id"}'
```

### Get Inbox
```bash
curl https://your-worker.workers.dev/api/inbox/your@email.address
```

## Endpoints

| Method | Endpoint | Description |
|-------|----------|-------------|
| POST | /api/auth/login | Login to platform |
| POST | /api/auth/logout | Logout |
| GET | /api/email/list | List emails |
| POST | /api/email/create | Create email |
| GET | /api/inbox/:address | Get inbox |
| GET | /api/inbox/:address/:id | Get message |
| DELETE | /api/email/:address | Delete email |
| GET | /api/domains | List domains |

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

## License

MIT