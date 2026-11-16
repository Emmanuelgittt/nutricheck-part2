/******************************************************************************
 * NutriCheck - WEB700 Project Part 2
 * Team NutriCheck: Emmanuel Okonkwo (121127252), Obioma Fortune (111118261)
 *
 * Express backend that serves our cleaned Open Food Facts data as JSON
 * routes and as EJS pages, with a search form and basic validation.
 ******************************************************************************/

const express = require("express");
const path = require("path");
const products = require("./data/products.json");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true })); // read form data
app.use(express.static(path.join(__dirname, "public"))); // CSS

// Search by product name or brand (case-insensitive, partial match)
const searchProducts = (keyword) => {
    const term = keyword.toLowerCase();
    return products.filter(
        (p) =>
            (p.name || "").toLowerCase().includes(term) ||
            (p.brand || "").toLowerCase().includes(term)
    );
};

// Filter by food group and/or Nutri-Score grade (both optional)
const filterProducts = (group, grade) =>
    products.filter(
        (p) =>
            (!group || p.foodGroup === group) &&
            (!grade || p.nutriScore === grade)
    );

// List of food groups for the dropdown, sorted A to Z
const foodGroups = [...new Set(products.map((p) => p.foodGroup).filter(Boolean))].sort();

// Reads ?group= and ?grade= from the URL and checks they are valid values
const readFilters = (query) => {
    const group = typeof query.group === "string" && foodGroups.includes(query.group) ? query.group : "";
    const grade = typeof query.grade === "string" && "abcde".includes(query.grade) && query.grade.length === 1 ? query.grade : "";
    return { group, grade };
};

// ---------------------------------------------------------------- HTML pages

// Home page
app.get("/", (req, res) => {
    res.render("index", { total: products.length });
});

// All products as cards (EJS), with optional filters, e.g. /products?grade=a
app.get("/products", (req, res) => {
    const { group, grade } = readFilters(req.query);
    const list = filterProducts(group, grade);
    res.render("products", { products: list, total: products.length, foodGroups, group, grade });
});

// Search form (EJS)
app.get("/search", (req, res) => {
    res.render("search", { keyword: "", results: [], error: null, searched: false });
});

// Process the search form with basic validation
app.post("/search", (req, res) => {
    const keyword = (req.body.keyword || "").trim();

    if (!keyword) {
        return res.render("search", {
            keyword: "",
            results: [],
            error: "Please enter a search keyword.",
            searched: false,
        });
    }

    const results = searchProducts(keyword);
    res.render("search", { keyword, results, error: null, searched: true });
});

// ---------------------------------------------------------------- JSON routes

// All products, with optional filters, e.g. /api/products?grade=a&group=Beverages
app.get("/api/products", (req, res) => {
    const { group, grade } = readFilters(req.query);
    res.json(filterProducts(group, grade));
});

// One product by id, e.g. /api/products/nc-001
app.get("/api/products/:id", (req, res) => {
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: `Product not found: ${req.params.id}` });
    }
    res.json(product);
});

// Search with a query string, e.g. /api/search?keyword=quaker
app.get("/api/search", (req, res) => {
    const keyword = typeof req.query.keyword === "string" ? req.query.keyword.trim() : "";
    if (!keyword) {
        return res.status(400).json({ error: "Please provide a keyword, e.g. /api/search?keyword=quaker" });
    }
    const results = searchProducts(keyword);
    res.json({ keyword, count: results.length, results });
});

// ---------------------------------------------------------------- 404

app.use((req, res) => {
    res.status(404).render("404", { url: req.originalUrl });
});

app.listen(HTTP_PORT, () => {
    console.log(`NutriCheck running at http://localhost:${HTTP_PORT}`);
});
