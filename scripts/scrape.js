const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const URL = "https://dining.ucla.edu/menus-at-a-glance/";
const OUTPUT = "portfolio/project1/menu.json";

(async () => {
  try {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);

    const result = [];

    $("h3").each((i, h3) => {
      const hallName = $(h3).text().trim();
      const parent = $(h3).parent();

      if (!hallName) return;

      const meals = {};

      parent.find("h4").each((i, meal) => {
        const mealName = $(meal).text().trim();
        const items = [];

        $(meal).nextUntil("h4").find("li").each((i, li) => {
          const text = $(li).text().trim();
          if (text) items.push(text);
        });

        if (mealName && items.length) {
          meals[mealName] = items;
        }
      });

      if (Object.keys(meals).length > 0) {
        result.push({
          diningHall: hallName,
          meals
        });
      }
    });

    if (!result.length) {
      console.error("No data parsed");
      process.exit(1);
    }

    fs.writeFileSync(OUTPUT, JSON.stringify(result, null, 2));
    console.log("Menu updated");

  } catch (err) {
    console.error("Scrape failed:", err.message);
    process.exit(1);
  }
})();
