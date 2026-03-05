// Main server setup (express config + routes)
import express from "express";
import playwrightAutofix from "./routes/playwrightAutofix";
import resume from "./routes/resume";
import apiKeys from "./routes/apiKeys";

const app = express();

app.use(express.json());

app.use("/api/playwright-autofix", playwrightAutofix);
app.use("/api/resume", resume);
app.use("/api/organizations/api_keys", apiKeys);

app.get("/", (req, res) => res.send("API Root"));

const server = app.listen(3001, () => console.log("Server running on port 3001"));

// Keep the process alive
server.on("close", () => process.exit(0));
