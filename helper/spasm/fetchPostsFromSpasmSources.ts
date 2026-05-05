import fs from 'fs';
import path from 'path';
import {
  SpasmSource,
  ConfigForSubmitSpasmEvent,
  UnknownEventV2,
  SpasmEventSource,
  AppConfig
} from "../../types/interfaces";
import {submitSpasmEvent} from '../sql/submitSpasmEvent';
import {poolDefault} from '../../db';
import {
  fetchAppConfig
} from "./../sql/sqlUtils";
import {
  sourcesOfficial,
  sourcesDefaultCrypto,
  sourcesDefaultPrivacy,
  sourcesDefaultTech,
  sourcesDefaultPolitics,
  sourcesOfficialReplies,
  sourcesDefaultCryptoReplies,
  sourcesDefaultPrivacyReplies,
  sourcesDefaultTechReplies,
  sourcesDefaultPoliticsReplies,
} from "./sources";
import {
  isArrayWithValues,
  extractHostnameFromUrl
} from '../utils/utils';
const { spasm } = require('spasm.js');
// SPASM module is disabled by default
// Override console.log for production
if (process.env.NODE_ENV !== "dev") {
  console.log = () => {}
  console.info = () => {}
  console.warn = () => {}
}

/**
 * There are different SPASM sources depending on
 * the update frequency: high, medium, low.
 * The exact time intervals of update frequencies
 * can be changed with .env variables.
 */
export const fetchPostsFromSpasmSources = async (
  frequency?: "low" | "medium" | "high" | "test"
) => {
  const appConfig: AppConfig = await fetchAppConfig()
  if (
    !appConfig || typeof(appConfig) !== "object" ||
    Array.isArray(appConfig)
  ) {
    console.log("cannot load appConfig")
    return null 
  }

  // Bree doesn't get updated values from appConfig.env file,
  // so we have to fetch appConfig every time from db.
  const {
    enableSpasmModule,
    enableSpasmSourcesUpdates,
    enableFederationDefaultLists,
    enableFederationDefaultListOfficial,
    enableFederationDefaultListCrypto,
    enableFederationDefaultListPrivacy,
    enableFederationDefaultListTech,
    enableFederationDefaultListPolitics,
    enableFederationCustomLinks,
    // enableFederationCustomSources,
    federationCustomLinks,
    ignoreWhitelistForActionPostInSpasmModule,
    ignoreWhitelistForActionReactInSpasmModule,
    ignoreWhitelistForActionReplyInSpasmModule,
    ignoreWhitelistForActionOtherInSpasmModule
  } = appConfig

  if (!frequency) return
  if (!enableSpasmModule) return
  if (!enableSpasmSourcesUpdates) return

  // console.log('process.env.NODE_ENV =', process.env.NODE_ENV)
  const time = new Date(Date.now()).toISOString();
  console.log('fetchPostsFromSpasmSources is called at:', time)

  let sources: SpasmEventSource[] = []

  /**
    * https://github.com/breejs/bree/tree/master/examples/typescript
    * Bree works weird with TypeScript, so getting sources from .ts file
    * in dev mode (with TS_NODE) and from .js file in production.
    */
  let absolutePath: string
  if (process.env.TS_NODE) {
    absolutePath = path.resolve(__dirname, 'custom/customSpasmSources.ts')
  } else {
    absolutePath = path.resolve(__dirname, 'custom/customSpasmSources.js')
  }

  // Check if a file with custom feed sources exists
  if (fs.existsSync(absolutePath)) {
    const {
      spasmSourcesFrequencyHigh,
      spasmSourcesFrequencyMedium,
      spasmSourcesFrequencyLow,
      spasmSourcesFrequencyTest
    } = require(absolutePath);

    switch (frequency) {
      case 'high':
        sources = spasmSourcesFrequencyHigh
        break
      case 'medium':
        sources = spasmSourcesFrequencyMedium
        break
      case 'low':
        sources = spasmSourcesFrequencyLow
        break
      case 'test':
        sources = spasmSourcesFrequencyTest
        break
    }
  } else {
    // It's now possible to enable federation via db events
    // console.error(absolutePath, "file doesn't exist. If you want to use SPASM module, make sure to create this file and specify SPASM sources as shown in the example file in the same folder.")
  }

  const getData = async (
    source: SpasmSource
  ): Promise<string> => {
    try {
      if (!source.apiUrl) return "ERROR: no API URL in Spasm source"

      // let fetchUrl = source.apiUrl
      // if (source.query) {
      //   fetchUrl += source.query
      // }
      // type ApiResponse = Post[]
      // const response: AxiosResponse<ApiResponse> = await axios.get<ApiResponse>(fetchUrl);

      const response = await spasm.fetchEventsFromSource(source)
      // console.log("response:", response)

      if (response) {
        let arrayOfPosts: UnknownEventV2[] = []
        // 1. Handle arrays of posts/events
        if (Array.isArray(response)) {
        /**
         * Reverse the order of posts/events in the response data
         * so the newest events are inserted into the database at
         * the end, so they will be shown at the top of the feed.
         */
          arrayOfPosts = arrayOfPosts.concat(
            response.reverse()
          )
        // 2. Handle single post/event as an object
        } else if (
          !Array.isArray(response) &&
          typeof(response) === 'object'
        ) {
          arrayOfPosts.push(response)
        }

        // Execute sequentially one by one
        for (const post of arrayOfPosts) {
          // Submit V2
          const customConfig = new ConfigForSubmitSpasmEvent()

          // Admins can choose to insert actions received from
          // other instances of the network even if they were
          // signed by non-whitelisted addresses.
          // In other words, admins can choose to trust other
          // instances to properly protect their instances,
          // e.g., from spam and low-quality content.
          if (ignoreWhitelistForActionPostInSpasmModule) {
            customConfig.whitelist.action.post.enabled = false
          }
          if (ignoreWhitelistForActionReactInSpasmModule) {
            customConfig.whitelist.action.react.enabled = false
          }
          if (ignoreWhitelistForActionReplyInSpasmModule) {
            customConfig.whitelist.action.reply.enabled = false
          }
          if (ignoreWhitelistForActionOtherInSpasmModule) {
            customConfig.whitelist.action.other.enabled = false
          }
          await submitSpasmEvent(post, poolDefault, customConfig)
        }

        return "Success. Finished fetching Spasm source (federation)"

      } else {
        console.log("data for submitting events is null")
      }
    } catch (err) {
      console.error('getData failed for source.apiUrl:', source.apiUrl, 'at', time, ', error message is hidden');
      return "ERROR: Something went wrong when getting data from Spasm source (federation)"
    }
  };

  try {
    if (enableFederationDefaultLists) {
      if (frequency === "medium" && enableFederationDefaultListPolitics) {
        sources.push(...sourcesDefaultPolitics)
      }

      if (frequency === "medium" && enableFederationDefaultListTech) {
        sources.push(...sourcesDefaultTech)
      }

      if (frequency === "medium" && enableFederationDefaultListPrivacy) {
        sources.push(...sourcesDefaultPrivacy)
      }

      if (frequency === "medium" && enableFederationDefaultListCrypto) {
        sources.push(...sourcesDefaultCrypto)
      }

      if (frequency === "medium" && enableFederationDefaultListOfficial) {
        sources.push(...sourcesOfficial)
      }

      if (frequency === "medium" && enableFederationDefaultListPolitics) {
        sources.push(...sourcesDefaultPoliticsReplies)
      }

      if (frequency === "medium" && enableFederationDefaultListTech) {
        sources.push(...sourcesDefaultTechReplies)
      }

      if (frequency === "medium" && enableFederationDefaultListPrivacy) {
        sources.push(...sourcesDefaultPrivacyReplies)
      }

      if (frequency === "medium" && enableFederationDefaultListCrypto) {
        sources.push(...sourcesDefaultCryptoReplies)
      }

      if (frequency === "medium" && enableFederationDefaultListOfficial) {
        sources.push(...sourcesOfficialReplies)
      }

    }

    if (enableFederationCustomLinks) {
      if (
        federationCustomLinks &&
        Array.isArray(federationCustomLinks) &&
        isArrayWithValues(federationCustomLinks)
      ) {
        federationCustomLinks.forEach(link => {
          if (link && typeof(link) === "string") {
            const parts = link.split("|")
            const url = parts[0] ?? ""
            const urlObj = new URL(url)
            const source: SpasmEventSource = {}
            const hostname = extractHostnameFromUrl(url)
            if (hostname && typeof(hostname) === "string") {
              source.name = hostname
            }
            if (
              urlObj.origin && urlObj.pathname &&
              typeof(urlObj.origin) === "string" &&
              typeof(urlObj.pathname) === "string"
            ) { source.apiUrl = urlObj.origin + urlObj.pathname }
            if (urlObj.search && typeof(urlObj.search) === "string") {
              source.query = urlObj.search
            }
            if (parts[1] && typeof(parts[1]) === "string") {
              // source.category = { name: parts[1] }
              source.category = parts[1]
            }
            let customFrequency = "medium"
            if (parts[2] && typeof(parts[2]) === "string") {
              customFrequency = parts[2].toLowerCase()
            }
            if (parts[3] && typeof(parts[3]) === "string") {
              source.network = parts[3] as "spasm" | "nostr" | "rss"
            }
            if (parts[4] && typeof(parts[4]) === "string") {
              source.name = parts[4]
            }
            if (
              parts[5] && typeof(parts[5]) === "string" &&
              parts[5] === "false"
            ) {
              source.showSource = false
            } else {
              source.showSource = true
            }
            if (
              frequency && customFrequency &&
              frequency === customFrequency
            ) {
              sources.push(source) }
          }
        })
      }
    }

    if (sources && sources[0]) {
      // Execute sequentially one by one
      for (const source of sources) {
        await getData(source)
      }
      return 'Success. Spasm sources fetched (federation)'
    }
    return 'There are no Spasm sources (federation)'

  } catch (err) {
    console.error(err);
    return 'ERROR: Something went wrong when fetching Spasm sources (federation)'
  }
}
