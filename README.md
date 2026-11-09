# NutriCheck – Project Part 2

**Team NutriCheck:** Emmanuel Okonkwo (121127252), Obioma Fortune (111118261)
**Course:** WEB700 – Web Programming, Seneca Polytechnic

NutriCheck helps people compare grocery products by their Nutri-Score (A to E), calories and sugar.
In Part 1 it was a front-end site. In Part 2 we are moving the data to our own **Node.js + Express** backend.

## Dataset

- **Source:** [Open Food Facts](https://world.openfoodfacts.org) – exported from the Open Food Facts API in Part 1 (Open Database License)
- **Raw file:** `source-data/part1-products.json` (200 products)
- **Cleaned file:** `data/products.json` (195 products with a name and nutrition data)
- **Cleaning script:** `scripts/prepare-data.js`

Each product has an `id`, `barcode`, `name`, `brand`, `quantity`, `foodGroup`, `nutriScore`, `novaGroup`,
`image`, a nested `nutrition` object (per 100 g) and an `ingredients` array.

To rebuild the cleaned file:

```
node scripts/prepare-data.js
```

## Planned routes

| Route | Output | Purpose |
|---|---|---|
| `GET /` | HTML | Home page with project name, description and links |
| `GET /api/products` | JSON | All products |
| `GET /api/products/:id` | JSON | One product by id (404 message if not found) |
| `GET /api/search?keyword=value` | JSON | Search by product name or brand |
| `GET /products` | HTML/EJS | Products shown as cards |
| `GET /search` | HTML/EJS | Search form |
| `POST /search` | HTML/EJS | Validates the keyword and shows results |

## How to run

*(Coming soon – the Express server is being built.)*

## Project status

- [x] Dataset selected and cleaned
- [ ] Express server and JSON routes
- [ ] EJS pages and search form
- [ ] Validation and testing
