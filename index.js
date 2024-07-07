const express = require("express");
const app = express();
const path = require("path"); //  for resolving file paths

//setup public folder
app.use(express.static(path.join(__dirname, "public")));
//middleware that handles HTML forms
app.use(express.urlencoded({ extended: true }));
//middleware for json response
app.use(express.json());

//Home page renderer
app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "public", "index.html");
  res.sendFile(indexPath);
});
//Route Handler for 404 Errors
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

app.listen(3000, () => console.log("Server Started"));
