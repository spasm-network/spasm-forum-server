import { fetchPostsFromSpasmSources } from "../helper/spasm/fetchPostsFromSpasmSources";

// Override console.log for production
if (process.env.NODE_ENV !== "dev") {
  console.log = () => {}
  console.info = () => {}
  console.warn = () => {}
}

if (true) {
  fetchPostsFromSpasmSources("medium")
}
