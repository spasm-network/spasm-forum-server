import {SpasmEventSource} from "../../types/interfaces"

export const sourcesOfficial: SpasmEventSource[] = [
  {
    name: "forum.spasm.network",
    uiUrl: "https://forum.spasm.network/news/",
    apiUrl: "https://forum.spasm.network/api/",
    query: "events?webType=web3&action=post&action=reply&signer=0x77779330274cf593048758f80b39352a0d727777&limit=10",
    showSource: true
  }
]

export const sourcesOfficialReplies: SpasmEventSource[] = [
  {
    name: "forum.spasm.network",
    uiUrl: "https://forum.spasm.network/news/",
    apiUrl: "https://forum.spasm.network/api/",
    query: "events?webType=web3&action=reply&limit=10",
    showSource: true
  }
]

export const sourcesDefaultCrypto: SpasmEventSource[] = [
  {
    name: "degenrocket.space",
    uiUrl: "https://degenrocket.space/news/",
    apiUrl: "https://degenrocket.space/api/",
    query: "events?webType=any&activity=rising&action=post&category=defi&category=crypto&category=nft&category=monero&category=bitcoin&category=ethereum&category=nft&limit=5",
    showSource: true
  },
  {
    name: "zkpunks.dev",
    uiUrl: "https://zkpunks.dev/news/",
    apiUrl: "https://zkpunks.dev/api/",
    query: "events?webType=any&activity=rising&action=post&category=defi&category=crypto&category=nft&category=monero&category=bitcoin&category=ethereum&category=nft&limit=5",
    showSource: true
  },
  {
    name: "forum.decentralizedscience.org",
    uiUrl: "https://forum.decentralizedscience.org/news/",
    apiUrl: "https://forum.decentralizedscience.org/api/",
    query: "events?webType=any&activity=rising&action=post&category=defi&category=crypto&category=nft&category=monero&category=bitcoin&category=ethereum&category=nft&category=desci&category=lunar&limit=5",
    showSource: true
  }
]

export const sourcesDefaultCryptoReplies: SpasmEventSource[] = [
  {
    name: "degenrocket.space",
    uiUrl: "https://degenrocket.space/news/",
    apiUrl: "https://degenrocket.space/api/",
    query: "events?webType=any&activity=rising&action=reply&category=defi&category=crypto&category=nft&category=monero&category=bitcoin&category=ethereum&category=nft&limit=10",
    showSource: true
  },
  {
    name: "forum.decentralizedscience.org",
    uiUrl: "https://forum.decentralizedscience.org/news/",
    apiUrl: "https://forum.decentralizedscience.org/api/",
    query: "events?webType=any&activity=rising&action=reply&category=defi&category=crypto&category=nft&category=monero&category=bitcoin&category=ethereum&category=nft&category=desci&category=lunar&limit=10",
    showSource: true
  }
]

export const sourcesDefaultPrivacy: SpasmEventSource[] = [
  {
    name: "degenrocket.space",
    uiUrl: "https://degenrocket.space/news/",
    apiUrl: "https://degenrocket.space/api/",
    query: "events?webType=any&activity=rising&action=post&category=privacy&category=monero&category=zcash&limit=5",
    showSource: true
  },
  {
    name: "dark.vegas",
    uiUrl: "https://dark.vegas/news/",
    apiUrl: "https://dark.vegas/api/",
    query: "events?webType=any&activity=rising&action=post&category=privacy&category=podcasts&category=monero&category=zcash&limit=5",
    showSource: true
  },
]

export const sourcesDefaultPrivacyReplies: SpasmEventSource[] = [
  {
    name: "degenrocket.space",
    uiUrl: "https://degenrocket.space/news/",
    apiUrl: "https://degenrocket.space/api/",
    query: "events?webType=any&activity=rising&action=reply&category=privacy&category=monero&category=zcash&limit=10",
    showSource: true
  },
  {
    name: "dark.vegas",
    uiUrl: "https://dark.vegas/news/",
    apiUrl: "https://dark.vegas/api/",
    query: "events?webType=any&activity=rising&action=reply&category=privacy&category=podcasts&category=monero&category=zcash&limit=10",
    showSource: true
  },
]

export const sourcesDefaultTech: SpasmEventSource[] = [
  {
    name: "degenrocket.space",
    uiUrl: "https://degenrocket.space/news/",
    apiUrl: "https://degenrocket.space/api/",
    query: "events?webType=any&activity=rising&action=post&category=tech&limit=5",
    showSource: true
  },
  {
    name: "zkpunks.dev",
    uiUrl: "https://zkpunks.dev/news/",
    apiUrl: "https://zkpunks.dev/api/",
    query: "events?webType=any&activity=rising&action=post&category=tech&limit=5",
    showSource: true
  },
]

export const sourcesDefaultTechReplies: SpasmEventSource[] = [
  {
    name: "degenrocket.space",
    uiUrl: "https://degenrocket.space/news/",
    apiUrl: "https://degenrocket.space/api/",
    query: "events?webType=any&activity=rising&action=post&category=tech&limit=10",
    showSource: true
  },
]

export const sourcesDefaultPolitics: SpasmEventSource[] = [
  {
    name: "degenrocket.space",
    uiUrl: "https://degenrocket.space/news/",
    apiUrl: "https://degenrocket.space/api/",
    query: "events?webType=any&activity=rising&action=post&category=politics&limit=5",
    showSource: true
  },
]

export const sourcesDefaultPoliticsReplies: SpasmEventSource[] = [
  {
    name: "degenrocket.space",
    uiUrl: "https://degenrocket.space/news/",
    apiUrl: "https://degenrocket.space/api/",
    query: "events?webType=any&activity=rising&action=reply&category=politics&limit=5",
    showSource: true
  },
]

