/******************************************************************************
 * NutriCheck - Project Part 2
 * prepare-data.js
 *
 * Cleans the Open Food Facts products we saved in Part 1 and writes the
 * smaller, cleaner file that the Express server will use.
 *
 *   Input:  source-data/part1-products.json  (raw Open Food Facts API export)
 *   Output: data/products.json              (cleaned dataset for Part 2)
 *
 * Run it with:  node scripts/prepare-data.js
 ******************************************************************************/

const fs = require("fs");
const path = require("path");

const INPUT_FILE = path.join(__dirname, "..", "source-data", "part1-products.json");
const OUTPUT_FILE = path.join(__dirname, "..", "data", "products.json");

// Values Open Food Facts uses when it does not know something
const UNKNOWN_VALUES = ["", "unknown", "not-applicable"];

/** Returns null for empty or "unknown" values, otherwise the trimmed text. */
const cleanText = (value) => {
    if (value === undefined || value === null) return null;
    const text = String(value).trim();
    return UNKNOWN_VALUES.includes(text.toLowerCase()) ? null : text;
};

/** Rounds a number to 2 decimals, or returns null if it is missing. */
const roundNumber = (value) => {
    const number = Number(value);
    if (value === undefined || value === null || Number.isNaN(number)) return null;
    return Math.round(number * 100) / 100;
};

/**
 * Splits the ingredients text into an array.
 * Commas inside brackets are kept, so "sugars (sugar, molasses)" stays one item.
 */
const splitIngredients = (text) => {
    if (!text) return [];
    const items = [];
    let current = "";
    let depth = 0;
    for (const char of text) {
        if (char === "(" || char === "[") depth++;
        if (char === ")" || char === "]") depth = Math.max(0, depth - 1);
        if (char === "," && depth === 0) {
            items.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    items.push(current);
    return items
        // remove Open Food Facts formatting marks (_milk_, *) and a final full stop
        .map((item) => item.replace(/[_*]/g, " ").replace(/\s+/g, " ").trim().replace(/\.$/, "").toLowerCase())
        .filter((item) => item.length > 0);
};

/** Turns one raw Open Food Facts product into our clean format. */
const cleanProduct = (raw, index) => {
    const n = raw.nutriments || {};
    const grade = cleanText(raw.nutriscore_grade);

    return {
        id: `nc-${String(index + 1).padStart(3, "0")}`,
        barcode: cleanText(raw.code),
        name: cleanText(raw.product_name),
        brand: cleanText(raw.brands),
        quantity: cleanText(raw.quantity),
        foodGroup: cleanText(raw.pnns_groups_1),
        nutriScore: grade && "abcde".includes(grade.toLowerCase()) ? grade.toLowerCase() : null,
        novaGroup: roundNumber(raw.nova_group),
        image: cleanText(raw.image_front_url),
        imageSmall: cleanText(raw.image_front_small_url),
        nutrition: {
            calories: roundNumber(n["energy-kcal_100g"]),
            fat: roundNumber(n.fat_100g),
            saturatedFat: roundNumber(n["saturated-fat_100g"]),
            carbohydrates: roundNumber(n.carbohydrates_100g),
            sugars: roundNumber(n.sugars_100g),
            fiber: roundNumber(n.fiber_100g),
            proteins: roundNumber(n.proteins_100g),
            salt: roundNumber(n.salt_100g),
        },
        ingredients: splitIngredients(raw.ingredients_text),
    };
};

try {
    const rawFile = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
    const rawProducts = Array.isArray(rawFile) ? rawFile : rawFile.products;

    // Keep only products that have a name and nutrition data
    const usable = rawProducts.filter((p) => cleanText(p.product_name) && p.nutriments);
    const products = usable.map(cleanProduct);

    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2) + "\n");

    console.log(`Read ${rawProducts.length} products, kept ${products.length}.`);
    console.log(`Saved cleaned data to ${path.relative(process.cwd(), OUTPUT_FILE)}`);
} catch (err) {
    console.error("Could not prepare the data:", err.message);
    process.exit(1);
}
