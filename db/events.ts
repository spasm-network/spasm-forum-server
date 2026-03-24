import {
  DmpEvent,
  NostrSpasmEventSignedOpened,
  SpasmEventV2
} from "../types/interfaces"

export const validDmpEvent: DmpEvent = {
  version: "dmp_v0.0.1",
  time: "2022-01-01T22:04:46.178Z",
  action: "post",
  target: "",
  title: "genesis",
  text: "not your keys, not your words",
  license: "MIT"
}

export const validDmpEventSignedClosedConvertedToSpasmV2: SpasmEventV2 = {
  type: "SpasmEventV2",
  action: "post",
  title: "genesis",
  content: "not your keys, not your words",
  timestamp: 1641074686178,
  authors: [
    {
      addresses: [
        {
          value: "0xf8553015220a857eda377a1e903c9e5afb3ac2fa",
          format: { name: "ethereum-pubkey" },
          verified: true
        }
      ]
    }
  ],
  license: "MIT",
  ids: [
    {
      value: "spasmid01192d1f9994bf436f50841459d0a43c0de13ef4aaa5233827bdfe2ea2bc030d6f",
      format: {
        name: "spasmid",
        version: "01"
      }
    },
    {
      value: "0xbd934a01dc3bd9bb183bda807d35e61accf7396c527b8a3d029c20c00b294cf029997be953772da32483b077eea856e6bafcae7a2aff95ae572af25dd3e204a71b",
      format: { name: "ethereum-sig", }
    }
  ],
  signatures: [
    {
      value: "0xbd934a01dc3bd9bb183bda807d35e61accf7396c527b8a3d029c20c00b294cf029997be953772da32483b077eea856e6bafcae7a2aff95ae572af25dd3e204a71b",
      pubkey: "0xf8553015220a857eda377a1e903c9e5afb3ac2fa",
      format: { name: "ethereum-sig" }
    }
  ],
  siblings: [
    {
      type: "SiblingDmpSignedV2",
      protocol: {
        name: "dmp",
        version: "0.0.1"
      },
      signedString: JSON.stringify(validDmpEvent),
      ids: [
        {
          value: "0xbd934a01dc3bd9bb183bda807d35e61accf7396c527b8a3d029c20c00b294cf029997be953772da32483b077eea856e6bafcae7a2aff95ae572af25dd3e204a71b",
          format: { name: "ethereum-sig" }
        }
      ],
      signatures: [
        {
          value: "0xbd934a01dc3bd9bb183bda807d35e61accf7396c527b8a3d029c20c00b294cf029997be953772da32483b077eea856e6bafcae7a2aff95ae572af25dd3e204a71b",
          pubkey: "0xf8553015220a857eda377a1e903c9e5afb3ac2fa",
          format: { name: "ethereum-sig" }
        }
      ]
    }
  ]
}

export const validNostrReplyToDmpEvent: NostrSpasmEventSignedOpened = {
    kind: 1,
    created_at: 1708153412,
    tags: [
      ["license","SPDX-License-Identifier: CC0-1.0"],
      ["spasm_version","1.0.0"],
      ["spasm_action","reply"],
      ["spasm_target","0xbd934a01dc3bd9bb183bda807d35e61accf7396c527b8a3d029c20c00b294cf029997be953772da32483b077eea856e6bafcae7a2aff95ae572af25dd3e204a71b"]
    ],
    content: "To the SPASM!",
    pubkey:"2d2d9f19a98e533c27500e5f056a2a56db8fe92393e7a2135db63ad300486f42",
    id:"4ca9b330abad821509acbfe90ebcc25f267e02718377eb4d831bc5bb9482c85f",
    sig:"2f8f195c70070f0c434c397da2fb44b1196994a2f24515d76477a8c8b5a4f289fcc5287d8163cbadfee29af55450fa9fa6b15ac732877d732e98e2be10acb290"
}

export const validPostWithNostrReplyToDmpEventConvertedToSpasmV2: SpasmEventV2 = {
  type: "SpasmEventV2",
  parent: {
    ids: [
      {
        value: "0xbd934a01dc3bd9bb183bda807d35e61accf7396c527b8a3d029c20c00b294cf029997be953772da32483b077eea856e6bafcae7a2aff95ae572af25dd3e204a71b",
        format: {
          name: "ethereum-sig"
        }
      }
    ]
  },
  db: {
    key: 5,
    addedTimestamp: 1705545460712
    // addedTimestamp: toBeTimestamp("2024-01-18T02:37:40.712Z")
  },
  action: "reply",
  content: "To the SPASM!",
  timestamp: 1708153412,
  authors: [
    {
      addresses: [
        {
          value: "2d2d9f19a98e533c27500e5f056a2a56db8fe92393e7a2135db63ad300486f42",
          format: {
            name: "nostr-hex",
          },
          verified: true
        }
      ]
    }
  ],
  license: "SPDX-License-Identifier: CC0-1.0",
  ids: [
    {
      value: "spasmid01906605460f67979a0f82eb220e58ba1de54aadebab4ed601c41ea695d51be1f0",
      format: {
        name: "spasmid",
        version: "01"
      }
    },
    {
      value: "4ca9b330abad821509acbfe90ebcc25f267e02718377eb4d831bc5bb9482c85f",
      format: {
        name: "nostr-hex",
      }
    },
    {
      value: "2f8f195c70070f0c434c397da2fb44b1196994a2f24515d76477a8c8b5a4f289fcc5287d8163cbadfee29af55450fa9fa6b15ac732877d732e98e2be10acb290",
      format: {
        name: "nostr-sig",
      }
    }
  ],
  signatures: [
    {
      value: "2f8f195c70070f0c434c397da2fb44b1196994a2f24515d76477a8c8b5a4f289fcc5287d8163cbadfee29af55450fa9fa6b15ac732877d732e98e2be10acb290",
      pubkey: "2d2d9f19a98e533c27500e5f056a2a56db8fe92393e7a2135db63ad300486f42",
      format: { name: "nostr-sig" }
    }
  ],
  siblings: [
    {
      type: "SiblingNostrSpasmSignedV2",
      protocol: {
        name: "nostr",
        hasExtraSpasmFields: true,
        extraSpasmFieldsVersion: "1.0.0"
      },
      originalObject: validNostrReplyToDmpEvent,
      ids: [
        {
          value: "4ca9b330abad821509acbfe90ebcc25f267e02718377eb4d831bc5bb9482c85f",
          format: {
            name: "nostr-hex",
          }
        },
        {
          value: "2f8f195c70070f0c434c397da2fb44b1196994a2f24515d76477a8c8b5a4f289fcc5287d8163cbadfee29af55450fa9fa6b15ac732877d732e98e2be10acb290",
          format: {
            name: "nostr-sig",
          }
        }
      ],
      signatures: [
        {
          value: "2f8f195c70070f0c434c397da2fb44b1196994a2f24515d76477a8c8b5a4f289fcc5287d8163cbadfee29af55450fa9fa6b15ac732877d732e98e2be10acb290",
          pubkey: "2d2d9f19a98e533c27500e5f056a2a56db8fe92393e7a2135db63ad300486f42",
          format: { name: "nostr-sig" }
        }
      ],
    }
  ],
  stats: [
    {
      action: "react",
      contents: [
        {
          value: "upvote",
          total: 11
        },
        {
          value: "downvote",
          total: 1
        },
        {
          value: "bullish",
          total: 2
        },
        {
          value: "bearish",
          total: 3
        },
        {
          value: "important",
          total: 6
        },
        {
          value: "scam",
          total: 3
        },
      ]
    },
    {
      action: "reply",
      total: 3
    }
  ]
}

export const welcomeEvents: SpasmEventV2[] = [
  validDmpEventSignedClosedConvertedToSpasmV2,
  validPostWithNostrReplyToDmpEventConvertedToSpasmV2
]
