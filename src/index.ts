import * as puppeteer from "puppeteer";
import * as fs from "fs";

interface Pokemon {
  id: number;
  name: string;
  types: string[];
  weaknesses: string[];
  category: string;
  abilities: string;
  height: number;
  weight: number;
  image: string;
  description: string;
  family: {
    first: number[];
    middle: number[];
    last: number[];
  };
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const pages = ["https://www.pokemon.com/br/pokedex/bulbasaur"];
  const pokemons: Pokemon[] = [];

  while (pokemons.length != pages.length) {
    await page.goto(pages[pages.length - 1]);
    const pokemon = await page.evaluate(() => ({
      id: eval(
        `Number(document.querySelector(".pokedex-pokemon-pagination-title .pokemon-number").innerText.replace("Nº", ""))`
      ),
      name: eval(
        `document.querySelector(".pokedex-pokemon-pagination-title").innerText.replace(document.querySelector(".pokedex-pokemon-pagination-title .pokemon-number").innerText,"").trim()`
      ),
      image: eval(
        `document.querySelector(".profile-images img").getAttribute("src")`
      ),
      height: eval(
        `Number([...document.querySelectorAll(".pokemon-ability-info.active .attribute-title"),].filter((li) => li.innerText === "Height")[0].nextElementSibling.innerText.replace("m", ""))`
      ),
      weight: eval(
        `Number([...document.querySelectorAll(".pokemon-ability-info.active .attribute-title"),].filter((li) => li.innerText === "Weight")[0].nextElementSibling.innerText.replace("kg", ""))`
      ),
      category: eval(
        `[...document.querySelectorAll(".pokemon-ability-info.active .attribute-title"),].filter((li) => li.innerText === "Category")[0].nextElementSibling.innerText.replace("kg", "")`
      ).split("\n"),
      abilities: eval(
        `[...document.querySelectorAll(".pokemon-ability-info.active .attribute-title"),].filter((li) => li.innerText === "Abilities")[0].nextElementSibling.innerText.replace("kg", "")`
      ).split("\n"),
      types: eval(
        `[...document.querySelectorAll(".pokedex-pokemon-attributes.active .dtm-type li"),].map((type) => type.innerText)`
      ),
      weaknesses: eval(
        `[...document.querySelectorAll(".pokedex-pokemon-attributes.active .dtm-weaknesses li")].map((type) => type.innerText)`
      ),
      description: eval(
        `document.querySelector(".version-descriptions.active").innerText`
      ),
      family: {
        first: eval(
          `[...document.querySelectorAll(".first .pokemon-number"),].map((evol) => Number(evol.innerText.replace("Nº", "")))`
        ),
        middle: eval(
          `[...document.querySelectorAll(".middle .pokemon-number"),].map((evol) => Number(evol.innerText.replace("Nº", "")))`
        ),
        last: eval(
          `[...document.querySelectorAll(".last .pokemon-number")].map((evol) =>Number(evol.innerText.replace("Nº", "")))`
        ),
      },
    }));
    console.log(pokemon);

    pokemons.push(pokemon);

    const next = await page.evaluate(() =>
      document.querySelector(".next").getAttribute("href")
    );

    if (next !== "/br/pokedex/bulbasaur")
      pages.push(`https://www.pokemon.com${next}`);
  }

  await browser.close();
  fs.writeFileSync("result.json", JSON.stringify({ pokemons }));
})();
