//require('dotenv').config({ path: "../.env" })
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { fetchFullIdsFromShortId } from "../helper/sql/fetchFullIdsFromShortId";
import {
  QueryFeedFiltersV2,
  FeedFiltersV2,
  SpasmEventV2,
  SpasmEventEnvelopeV2,
  SpasmEventEnvelopeWithTreeV2,
  AppConfig,
  GenerateRssFeedConfig
} from "../types/interfaces";
import {
  copyOf,
  isArrayWithValues, isObjectWithValues,
  isStringOrNumber, isValidUrl
} from "../helper/utils/utils";
import {submitSpasmEvent} from "../helper/sql/submitSpasmEvent";
import {
  buildTreeDown,
  fetchAllSpasmEventsV2ByFilter,
  fetchSpasmEventV2ById,
  fetchSpasmEventV2ByShortId,
  fetchAppConfig,
} from "../helper/sql/sqlUtils";
import {poolDefault} from "../db";
import { env, loadAppConfig } from "./../appConfig";
import {toBeHex} from "../helper/utils/nostrUtils";

const { spasm } = require('spasm.js');

const defaultRssFeedConfig: GenerateRssFeedConfig =
  new GenerateRssFeedConfig()
defaultRssFeedConfig.channel.title =
  env?.rssFeedChannelTitle || "Spasm"
defaultRssFeedConfig.channel.link =
  env?.rssFeedChannelLink || "https://forum.spasm.network"
defaultRssFeedConfig.channel.description =
  env?.rssFeedChannelDescription || "Unplug from slave tech!"
defaultRssFeedConfig.channel.imageUrl =
  env?.rssFeedChannelImageLink || "https://media.spasm.network/spasmim016863a1cae922c77a970a86e0d339455d6417c6106125b8ebac744e50f51581a9.jpeg"
defaultRssFeedConfig.customConvertToRssConfig = { 
  customDomain: (
    env?.rssFeedChannelLink ||
    "https://forum.spasm.network"
  ) + "/news"
}

dotenv.config();

const app: Express = express();

// Override console.log for production
console.log(`NODE_ENV=${process.env.NODE_ENV}`)
if (process.env.NODE_ENV !== "dev") {
  // var console =  {}
  console.log = () => {}
  console.info = () => {}
  console.warn = () => {}
}

app.use(cors())
app.use(express.json()) // => req.body

//ROUTES//

// Fetch full ID from a short ID
// Used to shorten IDs/signatures in long URLs
// to e.g. 20 symbols instead of 132/128
app.get("/api/short-id/:id", async(req: Request, res: Response) => {
  const shortId = req.query.id;
  console.log(`/api/short-id/:id called with shortId: ${shortId}`) 
  console.log("query:", req.query);

  try {
    const allFullIdsThatMatchShortId = await fetchFullIdsFromShortId(shortId)
    res.json(allFullIdsThatMatchShortId);
  } catch (err) {
    console.error(err);
  }
})

app.post("/api/submit/", async (req: Request, res: Response) => {
  const event = req.body.unknownEvent
    ? req.body.unknownEvent
    : req.body

  const submitResult = await submitSpasmEvent(event);
  return res.json(submitResult);
});

// Examples:
// "/api/events?webType=web3&category=any&source=false&activity=hot&keyword=false&limit=30",
// "/api/events?webType=web3&category=any&source=false&activity=hot&keyword=false&limit=30",
// Supports multiple signers, parentIds, actions, categories, and keywords:
// "/api/events?action=post&action=reply&webType=web3&category=any&limit=10",
// "/api/events?action=post&action=reply&category=defi&category=privacy&limit=20",
// "/api/events?category=defi&category=privacy&keyword=eth&keyword=xmr&limit=20",
// "/api/events?signer=0xf8553015220a857eda377a1e903c9e5afb3ac2fa"
// "/api/events?signer=npub1kwnsd0xwkw03j0d92088vf2a66a9kztsq8ywlp0lrwfwn9yffjqspcmr0z"
// "/api/events?signer=123&signer=456"
// "/api/events?parentId=123&parentId=456"
// Supports RSS:
// "/api/events?format=spasm&webType=web3&category=any&source=false&activity=hot&keyword=false&limit=30",
// "/api/events?format=rss&webType=web3&category=any&source=false&activity=hot&keyword=false&limit=30",
app.get("/api/events", async(req: Request, res: Response) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const originalUrl = req.originalUrl;
  const fullUri = `${protocol}://${host}${originalUrl}`;
  // const fullUrl = req.url;

  const q: QueryFeedFiltersV2 = req.query
  const filters: FeedFiltersV2 = {
    format: q.format && q.format !== 'false' ? q.format : null,
    webType: q.webType && q.webType !== 'false' ? q.webType : null,
    signer: q.signer && q.signer !== 'false' ? q.signer : null,
    parentId: q.parentId && q.parentId !== 'false' ? q.parentId : null,
    action: q.action && q.action !== 'false' ? q.action : null,
    category: q.category && q.category !== 'false' ? q.category : null,
    source: q.source && q.source !== 'false' ? q.source : null,
    activity: q.activity && q.activity !== 'false' ? q.activity : null,
    keyword: q.keyword && q.keyword !== 'false' ? q.keyword : null,
    limit: q.limit && q.limit !== 'false' ? q.limit : null,
  }

  // Show a few events if no query is passed
  if (!isObjectWithValues(q)) { filters.limit = 25 }

  try {
    const spasmEvents = await fetchAllSpasmEventsV2ByFilter(
      filters, poolDefault, "spasm_events"
    )

    // RSS format
    if (
      filters && "format" in filters &&
      filters.format === "rss"
    ) {
      const rssFeedConfig = copyOf(defaultRssFeedConfig)
      rssFeedConfig.filters = filters
      if (fullUri && typeof(fullUri) === "string") {
        rssFeedConfig.channel.fullUri = fullUri
      }
      const rssFeed: string = spasm
        .generateRssFeed(spasmEvents, rssFeedConfig)

      if (rssFeed) {
        setTimeout(() => {
          res.set('Content-Type', 'application/rss+xml')
          res.send(rssFeed) }, 200)
      } else { setTimeout(() => {res.json(null)}, 200) }

    // Spasm format (default)
    } else if (isArrayWithValues(spasmEvents)) {
      const spasmEventEnvelopes: SpasmEventEnvelopeV2[] =
        spasm.convertManyToSpasmEventEnvelope(spasmEvents)

      if (isArrayWithValues(spasmEventEnvelopes)) {
        setTimeout(() => {res.json(spasmEventEnvelopes)}, 200)
      } else {
        setTimeout(() => {res.json(null)}, 200)
      }
    } else {
      setTimeout(() => {res.json(null)}, 200)
    }
  } catch (err) {
    console.error(err);
    res.json(err);
  }
})

// Fetch one event with comments (tree)
// Examples:
// /api/events/search?e=abc123&action=reply&commentsDepth=10
app.get("/api/events/:id", async(req: Request, res: Response) => {
  // console.log('req.params.id in /api/events/:id is:', req.params.id)
  // console.log('req.params in /api/events/:id is:', req.params)
  // console.log('req.query in /api/events/:id is:', req.query)
  // console.log('req in /api/events/:id is:', req)
  // console.log('req.query.target in /api/events/:id is:', req.query.target)
  try {
    let id: (string | number) | null = null
    if (req.query.e && (
        typeof(req.query.e) === "string" ||
        typeof(req.query.e) === "number"
      )
    ) {
      id = String(req.query.e)
    } else if (
      req.params.id && req.params.id !== 'search'
    ) {
      id = String(req.params.id)
    }

    // Convert Nostr's note ID to hex ID
    if (
      String(id).length === 63 &&
      String(id).startsWith('note')
    ) { id = toBeHex(String(id)) }

    if (id && isStringOrNumber(id)) {
      let event: SpasmEventV2 | null = null
      if (
        env?.enableShortUrlsForWeb3Actions &&
        String(id).length === env?.shortUrlsLengthOfWeb3Ids &&
        !isValidUrl(id)
      ) {
        event = await fetchSpasmEventV2ByShortId(id)
      } else {
        event = await fetchSpasmEventV2ById(id)
      }

      if (
        typeof(Number(req.query.commentsDepth)) === "number" &&
        Number(req.query.commentsDepth) > 0
      ) {
        const maxDepth: number = Number(req.query.commentsDepth)
        const eventWithTree =
          await buildTreeDown(event, poolDefault, maxDepth)
        if (eventWithTree && isObjectWithValues(eventWithTree)) {
          const spasmEventEnvelopeWithTree: SpasmEventEnvelopeWithTreeV2 =
            spasm.convertToSpasmEventEnvelopeWithTree(eventWithTree)
          if (
            spasmEventEnvelopeWithTree &&
            isObjectWithValues(spasmEventEnvelopeWithTree)
          ) {
            const setRes = () => res.json(spasmEventEnvelopeWithTree)
            setTimeout(setRes, 300)
          } else {
            const setRes = () => res.json(null)
            setTimeout(setRes, 300)
          }
          return;
        }
      } else {
        if (event && isObjectWithValues(event)) {
          const spasmEventEnvelope: SpasmEventEnvelopeWithTreeV2 =
            spasm.convertToSpasmEventEnvelope(event)
          if (
            spasmEventEnvelope &&
            isObjectWithValues(spasmEventEnvelope)
          ) {
            const setRes = () => res.json(spasmEventEnvelope)
            setTimeout(setRes, 300)
          } else {
            const setRes = () => res.json(null)
            setTimeout(setRes, 300)
          }
          return;
        }
      }
    }

    const setRes = () => res.json({ error: 'ERROR: event has not been found' })
    setTimeout(setRes, 300)
    // res.json({ error: 'post has not been found' })
    return
  } catch (err) {
    console.error(err);
    res.json(err);
  }
})

app.get("/api/app-config", async(_: Request, res: Response) => {
  const appConfig: AppConfig = await fetchAppConfig()
  if (
    !appConfig || typeof(appConfig) !== "object" ||
    Array.isArray(appConfig)
  ) {
    res.json({})
  } else {
    res.json(appConfig)
  }
})

let server;

export const startServer = (port: string | number) => {
  server = app.listen(port, async () => {
    // Load the latest app config from database upon launch
    await loadAppConfig()
    console.log(`The app is listening at http://localhost:${port}`);
  });
};

export const closeServer = async () => {
  if (server) {
    await server.close();
  }
};

export default app;

// For RSS tests:
// app.get("/api/rss-fetch-testrun", async (req, res) => {
//   console.log('/api/rss-fetch-testrun is called')
//   if (enableRssModule && enableRssSourcesUpdates) {
//     try {
//       const result = await fetchPostsFromRssSources("test")
//       return res.json(result);
//     } catch (err) {
//       console.error(err);
//     }
//   }
// });
