document.addEventListener("DOMContentLoaded", function () {
  const RecGrid = document.querySelector("#RecGrid");
  const recipeDetailsDiv = document.querySelector("#recipeDetails");
  const recipeDSection = document.querySelector("#recipeD");
  const searchInput = document.querySelector("#searchinput");
  const searchBtn = document.querySelector("#seachbtn");
  const buttonsContainer = document.querySelector("#buttonsContainer");
  const favoriteRecipes = []; // Array to store favorite recipe IDs

  if (!RecGrid) {
    console.error("No element with ID 'RecGrid' found.");
    return;
  }

  async function getFilteredRecipes(ingredient) {
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
      );
      if (!response.ok) {
        throw new Error(`HTTP-Error: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);

      // Clear the RecGrid before adding new content
      RecGrid.innerHTML = "";

      // Loop through each meal and create HTML for it
      data.meals.forEach((meal) => {
        RecGrid.innerHTML += `
          <div class="bg-white space-y-3 relative p-4 rounded-lg shadow-lg">
            <img src="${meal.strMealThumb}" alt="food" class="w-full rounded-t-lg">
            <h2 class="pl-2 font-bold text-xl">${meal.strMeal}</h2>
            <button class="recipe-btn bg-amber-700 hover:bg-amber-500 w-full p-2 rounded-2xl font-bold" data-meal-id="${meal.idMeal}">View Recipe</button>
            <button class="fav-btn bg-amber-700 hover:bg-amber-500 w-full p-2 rounded-2xl font-bold" data-meal-id="${meal.idMeal}">Add to Favorites</button>
          </div>`;
      });

      const favoriteButton = document.querySelectorAll(".fav-btn");
      // Event listener for the search button
      favoriteButton.forEach((button) => {
        button.addEventListener("click", function () {
          const mealId = button.getAttribute("data-meal-id");

          if (favoriteRecipes.includes(mealId)) {
            // Remove recipe from favorites
            const removeIndex = favoriteRecipes.indexOf(mealId);
            favoriteRecipes.splice(removeIndex, 1);
            favoriteButton.textContent = "Add to Favorites";
          } else {
            // Add recipe to favorites
            favoriteRecipes.push(mealId);
            favoriteButton.textContent = "Remove from Favorites";
          }
          // Save updated favorites to local storage
          saveFavorites();
        });
      });
      loadFavorites();
      // Load favorite recipes from local storage (if any)
      function loadFavorites() {
        const storedRecipes = localStorage.getItem("favoriteRecipes");
        if (storedRecipes) {
          favoriteRecipes.push(...JSON.parse(storedRecipes)); // Parse JSON and add to array
        }
      }

      // Save favorite recipes to local storage
      function saveFavorites() {
        localStorage.setItem(
          "favoriteRecipes",
          JSON.stringify(favoriteRecipes)
        );
        console.log(
          "Saved favorites : " + localStorage.getItem("favoriteRecipes")
        );
      }
      // Add event listeners to each recipe button
      const recipeButtons = document.querySelectorAll(".recipe-btn");
      recipeButtons.forEach((button) => {
        button.addEventListener("click", async function () {
          const mealId = button.getAttribute("data-meal-id");
          await showRecipeDetails(mealId);
          recipeDSection.scrollIntoView({ behavior: "smooth" });
        });
      });
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }

  async function fetchRecipeDetails(idMeal) {
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`
      );
      if (!response.ok) {
        throw new Error(`HTTP-Error: ${response.status}`);
      }
      const data = await response.json();
      return data.meals[0]; // Return the meal object
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      return null;
    }
  }

  async function showRecipeDetails(idMeal) {
    try {
      const recipe = await fetchRecipeDetails(idMeal);
      if (recipe) {
        // Collect all ingredients
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
          const ingredient = recipe[`strIngredient${i}`];
          const measure = recipe[`strMeasure${i}`];
          if (ingredient && ingredient.trim() !== "") {
            ingredients.push(`${measure} ${ingredient}`);
          }
        }

        // Extract YouTube video ID
        const youtubeUrl = recipe.strYoutube;
        const videoId = youtubeUrl.split("v=")[1];
        const ampersandPosition = videoId ? videoId.indexOf("&") : -1;
        const cleanVideoId =
          ampersandPosition !== -1
            ? videoId.substring(0, ampersandPosition)
            : videoId;

        // Display the recipe details
        recipeDetailsDiv.innerHTML = `
          <h1 class="font-extrabold text-3xl mb-4">${recipe.strMeal}</h1>
          <img src="${recipe.strMealThumb}" alt="${
          recipe.strMeal
        }" class="w-full rounded-lg mb-4">
          <p class="text-lg mb-4"><strong>Area:</strong> ${recipe.strArea}</p>
          <p class="text-lg mb-4"><strong>Ingredients:</strong></p>
          <ul class="list-disc list-inside mb-4">
            ${ingredients
              .map((ingredient) => `<li>${ingredient}</li>`)
              .join("")}
          </ul>
          <p class="text-lg mb-4">${recipe.strInstructions}</p>
          <div class="flex justify-center mt-4">
            <iframe width="560" height="315" src="https://www.youtube.com/embed/${cleanVideoId}" frameborder="0" allowfullscreen></iframe>
          </div>
        `;
      } else {
        console.error("Recipe details not found.");
      }
    } catch (error) {
      console.error("Error displaying recipe details:", error);
    }
  }

  async function fetchAndDisplayCountries() {
    try {
      const response = await fetch(
        "https://www.themealdb.com/api/json/v1/1/list.php?a=list"
      );
      if (!response.ok) {
        throw new Error(`HTTP-Error: ${response.status}`);
      }
      const data = await response.json();
      const countries = data.meals;

      // Clear the container before adding new buttons
      buttonsContainer.innerHTML = "";

      countries.forEach((country) => {
        const countryButton = document.createElement("button");
        countryButton.className =
          "w-14 hover:border hover:border-slate-900 transition-all focus:p-4 focus:border-slate-900 focus:border";
        countryButton.textContent = country.strArea;
        countryButton.addEventListener("click", () => {
          getFilteredRecipesByCountry(country.strArea);
        });
        buttonsContainer.appendChild(countryButton);
      });
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  }

  async function getFilteredRecipesByCountry(country) {
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?a=${country}`
      );
      if (!response.ok) {
        throw new Error(`HTTP-Error: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);

      // Clear the RecGrid before adding new content
      RecGrid.innerHTML = "";

      // Loop through each meal and create HTML for it
      data.meals.forEach((meal) => {
        RecGrid.innerHTML += `
          <div class="bg-white space-y-3 relative p-4 rounded-lg shadow-lg">
            <img src="${meal.strMealThumb}" alt="food" class="w-full rounded-t-lg">
            <h2 class="pl-2 font-bold text-xl">${meal.strMeal}</h2>
            <button class="recipe-btn bg-amber-700 hover:bg-amber-500 w-full p-2 rounded-2xl font-bold" data-meal-id="${meal.idMeal}">View Recipe</button>
          </div>`;
      });

      // Add event listeners to each recipe button
      const recipeButtons = document.querySelectorAll(".recipe-btn");
      recipeButtons.forEach((button) => {
        button.addEventListener("click", async function () {
          const mealId = button.getAttribute("data-meal-id");
          await showRecipeDetails(mealId);
          recipeDSection.scrollIntoView({ behavior: "smooth" });
        });
      });
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }

  // Initial load of recipes with a default ingredient
  getFilteredRecipes("chicken_breast");

  // Fetch and display countries
  fetchAndDisplayCountries();
});
