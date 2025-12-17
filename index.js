// Entry point for platforms that expect ./index.js (e.g., Render default start command).
// It delegates to the compiled server in ./dist/server.js, which is produced by `npm run build`.
require("./dist/server");
