require("dotenv").config(); // loads .env locally; in Azure it just uses real env vars

const crypto = require("crypto");
const express = require("express");
const path = require("path");
const { tasksContainer } = require("./cosmosClient");

const app = express();
app.use(express.json());

/**
 * GET /api/tasks?assigneeId=user-001
 * Returns all tasks for a given assigneeId.
 */
app.get("/api/tasks", async (req, res) => {
  try {
    const assigneeId = req.query.assigneeId;
    if (!assigneeId) {
      return res.status(400).json({ error: "assigneeId query param is required" });
    }

    // Partition key design: /assigneeId (recommended for tasks by user).
    // Query by assigneeId is a typical access pattern. [6](https://github.com/Microsoft/sarif-vscode-extension/releases)[7](https://deepwiki.com/microsoft/sarif-visualstudio-extension/4.1-github-advanced-security-integration)
    const querySpec = {
      query: "SELECT * FROM c WHERE c.assigneeId = @assigneeId",
      parameters: [{ name: "@assigneeId", value: assigneeId }],
    };

    const { resources } = await tasksContainer.items.query(querySpec).fetchAll();
    return res.json(resources);
  } catch (err) {
    console.error("Failed to fetch tasks:", err);
    return res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

/**
 * POST /api/tasks
 * Creates a new task item.
 */
app.post("/api/tasks", async (req, res) => {
  try {
    const task = req.body || {};

    if (!task.assigneeId || !task.userName || !task.userEmail || !task.taskName) {
      return res.status(400).json({ error: "assigneeId, userName, userEmail, and taskName are required" });
    }

    if (!task.id) {
      if (typeof crypto?.randomUUID === "function") {
        task.id = `task-${crypto.randomUUID()}`;
      } else {
        task.id = `task-${Date.now()}`;
      }
    }

    const { resource } = await tasksContainer.items.create(task);
    return res.status(201).json(resource);
  } catch (err) {
    console.error("Failed to create task:", err);
    return res.status(500).json({ error: "Failed to create task" });
  }
});

// Serve static files (index.html, script.js, style.css) from root
app.use(express.static(__dirname));

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});