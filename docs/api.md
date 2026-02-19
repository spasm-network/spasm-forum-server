### API Endpoints Overview

| Method | Path | Description |
|---|---|---|
| GET | `/api/events` | Fetch events with filtering (JSON or RSS). |
| GET | `/api/events/:id` | Fetch a single event by ID, optionally with its comment tree. |
| POST | `/api/submit/` | Submit a new event. |

---

### GET /api/events

Fetches a list of events based on filters. Returns JSON (`SpasmEventEnvelopeV2[]`) or RSS.

**Query Parameters**

All parameters are optional. Multiple values can be provided by repeating the parameter name (e.g., `?category=defi&category=privacy`).

| Parameter | Type | Description | Example |
|---|---|---|---|
| `format` | string | Response format. `spasm` (JSON) or `rss`. Defaults to `spasm`. | `format=rss` |
| `webType` | string | Filter by web type. `web3` is a signed event (e.g., Spasm, Nostr, DMP event), `web2` is an unsigned event (e.g., legacy post fetched from an RSS feed). All web3 and web2 events are wrapped in SpasmEventV2. | `webType=web3` |
| `signer` | string | Filter by one or more signer IDs (e.g., Ethereum address, Nostr npub, or any other pubkey). | `signer=0xf855...` |
| `parentId` | string | Filter by one or more parent event IDs. ID can be Spasm ID, Nostr ID, DMP ID, GUID, URL, or any other string. | `parentId=123` |
| `action` | string | Filter by one or more action types (e.g., `post`, `reply`, `react`, `moderate`). | `action=post` |
| `category` | string | Filter by one or more categories (e.g., `defi`, `privacy`). | `category=defi` |
| `source` | string | Filter by a specific source. | `source=thedefiant.io` |
| `activity` | string | Filter by activity level (e.g., `all`, `rising`, `hot`), which usually depends on the amount of reactions. | `activity=hot` |
| `keyword` | string | Filter by one or more keywords. | `keyword=eth` |
| `limit` | string | Maximum number of events to return. | `limit=30` |

**Response Formats**

- RSS (`format=rss`): RSS XML feed.
- JSON (default or `format=spasm`): `SpasmEventEnvelopeV2[]` or `null`.

Important: after receiving envelopes, you should convert them to Spasm events, which will uncompress events and **verify signatures**. You can use spasm.js library ([npm](https://www.npmjs.com/package/spasm.js) / [git](https://github.com/spasm-network/spasm.js)).

```js
const events: SpasmEventV2[] = spasm.convertManyToSpasm(response)
```

**Example Requests**

```bash
GET /api/events?webType=web2&activity=hot&limit=30
GET /api/events?webType=web3&category=tech&action=reply
GET /api/events?format=rss&category=defi&category=privacy&limit=20
GET /api/events?signer=0xf8553015220a857eda377a1e903c9e5afb3ac2fa
GET /api/events?signer=npub1kwnsd0xwkw03j0d92088vf2a66a9kztsq8ywlp0lrwfwn9yffjqspcmr0z
GET /api/events?parentId=spasmid01192d1f9994bf436f50841459d0a43c0de13ef4aaa5233827bdfe2ea2bc030d6f
GET /api/events?parentId=https://dark.fi/insights/darkfi-app-alpha-release.html
GET /api/events?source=thedefiant.io
GET /api/events?keyword=spasm
```

---

### GET /api/events/:id

Fetches a single event by ID, optionally including its comment tree.

**Parameters**

| Parameter | Type | In | Description |
|---|---|---|---|
| `id` | string | Path | Event ID (supports Spasm ID, DMP ID,  Nostr note1, Nostr hex, or short IDs). |
| `e` | string | Query | Alternative way to specify the event ID. Make sure to add `search`, e.g., `api/events/search?e=`. Note: doesn't support short IDs, so full ID should be specified |
| `commentsDepth` | string | Query | Max depth of the comment tree to include. Omit to return the event only. |

**Response**

- Success: `SpasmEventEnvelopeWithTreeV2`.
- Not found: `{ error: 'ERROR: event has not been found' }`.

Important: after receiving an envelope, you should convert it to a Spasm event, which will uncompress an event and **verify signatures**. You can use spasm.js library ([npm](https://www.npmjs.com/package/spasm.js) / [git](https://github.com/spasm-network/spasm.js)).

```js
const event: SpasmEventV2 = spasm.convertToSpasm(response)
```

**Behavior Notes**

- If `commentsDepth` > 0, the response includes nested replies up to the specified depth.
- Nostr `note1...` IDs are converted to hex automatically.

**Example Requests**

```bash
GET /api/events/spasmid01192d1f9994bf436f50841459d0a43c0de13ef4aaa5233827bdfe2ea2bc030d6f
GET /api/events/spasmid01192d1f9994bf436f50841459d0a43c0de13ef4aaa5233827bdfe2ea2bc030d6f?commentsDepth=3
GET /api/events/search?e=spasmid01192d1f9994bf436f50841459d0a43c0de13ef4aaa5233827bdfe2ea2bc030d6f&commentsDepth=10
```

---

### POST /api/submit/

Submits a new event.

**Request Body**

Send a `SpasmEventEnvelopeV2` object. You can wrap it in `{ unknownEvent: ... }` or send the object directly.

**Response**

Returns the result from `submitSpasmEvent` (typically a confirmation or the created event).

**Example Request**

```bash
POST /api/submit/
Content-Type: application/json

{
  "type": "SpasmEventEnvelopeV2",
  "ids": [...],
  "siblings": [...],
  "db": {...},
  "source": {...},
  "stats": [...],
  "sharedBy": {...}
}
```

Note: you can use spasm.js library ([npm](https://www.npmjs.com/package/spasm.js) / [git](https://github.com/spasm-network/spasm.js)) to convert your Spasm, DMP, Nostr event to SpasmEventEnvelopeV2.

```js
const envelope = spasm.convertToSpasmEventEnvelope(event)
```

Note: your event might be rejected if it doesn't meet certain requirements. For example, a Spasm instance can restrict new events with whitelisting, token-gating, proof-of-work, etc.
