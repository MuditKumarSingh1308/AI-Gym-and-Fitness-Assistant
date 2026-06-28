const express = require("express");
const cors = require("cors");
const { PythonShell } = require("python-shell");

const { connectToDatabase, getDatabaseHealth } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    backend: "ok",
    message: "AI Gym Assistant Running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    backend: { status: "ok" },
    database: getDatabaseHealth(),
  });
});

app.get("/diet", (req, res) => {
  const options = {
    scriptPath: "../ai-models",
    args: ["70", "muscle"],
  };

  PythonShell.run("diet_model.py", options, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Diet model failed");
      return;
    }

    res.send(results);
  });
});

app.get("/analytics", (req, res) => {
  res.json({
    users: 120,
    workouts: 340,
    active: 45,
  });
});

if (require.main === module) {
  const { PORT } = require("./config");
  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((error) => {
      console.error("Failed to start backend:", error.message);
      process.exit(1);
    });
}

module.exports = app;
