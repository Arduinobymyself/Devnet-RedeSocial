const { exec } = require("child_process");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { cwd } = require("process");
const path = require("path");

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

app.post("/", async (req, res) => {
  const body = req.body;
  const base64Data = body.imagem;
  const buffer = Buffer.from(base64Data, "base64");
  const filename = `images/posts/${Date.now()}_${body.filename}`;

  fs.writeFile(path.join(cwd(), filename), buffer, async (err) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Failed to store image");
      return;
    }

    body.imagem = filename;
    delete body.filename;

    const response = await fetch("http:127.0.0.1:8001/posts", {
      method: "post",
      body: JSON.stringify(body),
    });

    res.send("Image uploaded");
  });
});
app.listen("8000", () => {
  console.log("Server running on port 8000");

  exec(
    "json-server src/db/collections.json -p 8001",
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout:\n${stdout}`);
    }
  );
});
