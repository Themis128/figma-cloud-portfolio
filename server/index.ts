// Main server setup (express config + routes)
import express from "express";
import playwrightAutofix from "./routes/playwrightAutofix";
import resume from "./routes/resume";

const app = express();

app.use("/api/playwright-autofix", playwrightAutofix);
app.use("/api/resume", resume);

app.get("/", (req, res) => res.send("API Root"));

app.listen(3001, () => console.log("Server running on port 3001"));
