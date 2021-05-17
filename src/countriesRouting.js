const express = require("express");
const bodyParser = require("body-parser");
const countriesRouting = express();
const countries = require("./countries.json");
const { body, validationResult } = require("express-validator");
/* countriesRouting.use(require("express").json()); */
countriesRouting.use(bodyParser.urlencoded({ extended: false }));

const countryValidation = [
  body("alpha2Code").isLength({ min: 2, max: 2 }),
  body("alpha3Code").isLength({ min: 3, max: 3 }),
  body("numeric").isLength({ min: 3, max: 3 })
];

let ejs = require("ejs");
countriesRouting.set("view engine", "ejs");
countriesRouting.get("/", (req, res) => {
  res.render("pages/index");
});
countriesRouting.get("/about", function (req, res) {
  res.render("pages/about");
});

countriesRouting.get("/api/countries", (req, res) => {
  let filteredArray = countries;
  if (req.query.visited) {
    filteredArray = filteredArray.filter((e) => e.visited === true);
    console.log("only visited?");
  }
  let countryArray = [];
  for (let i = 0; i < filteredArray.length; i++) {
    countryArray.push(filteredArray[i].country);
  }
  if (req.query.sort) {
    countryArray.sort();
  }

  let html = "<ul>";
  for (let j = 0; j < countryArray.length; j++) {
    html += `<li>${countryArray[j]}</li>`;
  }
  html += "</ul>";
  res.render("pages/countries", {
    html: html
  });
  /*   res.send(`<h1>List of all the countries:</h1>
    ${html}`) */
});

countriesRouting.get("/api/countries/:code", (req, res) => {
  const code = req.params.code;
  const country = countries.find(
    ({ alpha2Code, alpha3Code }) => alpha2Code === code || alpha3Code === code
  );
  if (country) res.send(country);
  else res.send("No country found :(");
});

countriesRouting.put("/api/countries/:code", countryValidation, (req, res) => {
  const code = req.params.code;
  const country = countries.find(
    ({ alpha2Code, alpha3Code }) => alpha2Code === code || alpha3Code === code
  );
  if (country) {
    country.country = req.body.country;
    country.alpha2Code = req.body.alpha2Code;
    country.alpha3Code = req.body.alpha3Code;
    country.numeric = req.body.numeric;
    res.send(country);
  } else res.send("No country found :(");
});

countriesRouting.post("/api/countries", countryValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  console.log(req);
  let countryCodeArray = [];
  for (let i = 0; i < countries.length; i++) {
    countryCodeArray.push(countries[i].alpha2Code);
    countryCodeArray.push(countries[i].alpha3Code);
  }
  const newCountry = {
    id: countries.length + 1,
    country: req.body.country,
    alpha2Code: req.body.alpha2Code,
    alpha3Code: req.body.alpha3Code,
    numeric: req.body.numeric,
    visited: false
  };
  if (countryCodeArray.some((e) => newCountry.alpha2Code === e)) {
    res.send("Duplicate Alpha 2 Code :(");
  } else if (countryCodeArray.some((e) => newCountry.alpha3Code === e)) {
    res.send("Duplicate Alpha 3 Code :(");
  } else {
    countries.push(newCountry);
    res.send(countries);
  }
});

countriesRouting.get("/api/add", (req, res) => {
  res.render("pages/posting");
});

countriesRouting.delete("/api/countries/:code", (req, res) => {
  const code = req.params.code;
  const country = countries.find(
    ({ alpha2Code, alpha3Code }) => alpha2Code === code || alpha3Code === code
  );
  country.visited = true;
  /*   const index = countries.indexOf(country);
  countries.splice(index, 1); */
  res.send(country);
});

module.exports = countriesRouting;
