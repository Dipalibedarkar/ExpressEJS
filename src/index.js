const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());

const countriesRouting = require("./countriesRouting");
app.use("/", countriesRouting);

app.listen(port, console.log(`Server is running on port ${port}`));
