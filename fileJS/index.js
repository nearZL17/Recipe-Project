document.addEventListener("DOMContentLoaded", function() {
  const RecGrid = document.querySelector("#RecGrid");
  const recipeDetailsDiv = document.querySelector("#recipeDetails");
  const recipeDSection = document.querySelector("#recipeD");
  const searchInput = document.querySelector("#searchinput");
  const searchBtn = document.querySelector("#seachbtn");
  const buttonsContainer = document.querySelector("#buttonsContainer");
  
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('i');

  themeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      if (document.documentElement.classList.contains('dark')) {
          themeIcon.classList.replace('bxs-moon', 'bxs-sun');
      } else {
          themeIcon.classList.replace('bxs-sun', 'bxs-moon');
      }
  });
  if (!RecGrid) {
    console.error("No element with ID 'RecGrid' found.");
    return;
  }

  async function getFilteredRecipes(ingredient) {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
      if (!response.ok) {
        throw new Error(`HTTP-Error: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);

      RecGrid.innerHTML = '';

      data.meals.forEach(meal => {
        RecGrid.innerHTML += `
          <div class="bg-white space-y-3 relative p-4 rounded-lg shadow-lg">
            <img src="${meal.strMealThumb}" alt="food" class="w-full rounded-t-lg">
            <h2 class="pl-2 font-bold text-xl">${meal.strMeal}</h2>
            <button class="recipe-btn bg-amber-700 hover:bg-amber-500 w-full p-2 rounded-2xl font-bold" data-meal-id="${meal.idMeal}">View Recipe</button>
            <button class="favorite-btn bg-amber-700 hover:bg-amber-500 w-full p-2 rounded-2xl font-bold" data-meal-id="${meal.idMeal}" data-meal-name="${meal.strMeal}" data-meal-thumb="${meal.strMealThumb}">Favorite</button>
          </div>`;
      });

      const recipeButtons = document.querySelectorAll(".recipe-btn");
      recipeButtons.forEach(button => {
        button.addEventListener("click", async function() {
          const mealId = button.getAttribute("data-meal-id");
          await showRecipeDetails(mealId);
          recipeDSection.scrollIntoView({ behavior: 'smooth' });
        });
      });

      const favoriteButtons = document.querySelectorAll(".favorite-btn");
      favoriteButtons.forEach(button => {
        button.addEventListener("click", function() {
          const mealId = button.getAttribute("data-meal-id");
          const mealName = button.getAttribute("data-meal-name");
          const mealThumb = button.getAttribute("data-meal-thumb");
          saveFavoriteRecipe({ id: mealId, name: mealName, thumb: mealThumb });
        });
      });
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }

  function saveFavoriteRecipe(recipe) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.some(fav => fav.id === recipe.id)) {
      favorites.push(recipe);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      alert(`${recipe.name} has been added to your favorites!`);
    } else {
      alert(`${recipe.name} is already in your favorites!`);
    }
  }

  async function fetchRecipeDetails(idMeal) {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
      if (!response.ok) {
        throw new Error(`HTTP-Error: ${response.status}`);
      }
      const data = await response.json();
      return data.meals[0];
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      return null;
    }
  }

  async function showRecipeDetails(idMeal) {
    try {
      const recipe = await fetchRecipeDetails(idMeal);
      if (recipe) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
          const ingredient = recipe[`strIngredient${i}`];
          const measure = recipe[`strMeasure${i}`];
          if (ingredient && ingredient.trim() !== "") {
            ingredients.push(`${measure} ${ingredient}`);
          }
        }

        const youtubeUrl = recipe.strYoutube;
        const videoId = youtubeUrl.split('v=')[1];
        const ampersandPosition = videoId ? videoId.indexOf('&') : -1;
        const cleanVideoId = ampersandPosition !== -1 ? videoId.substring(0, ampersandPosition) : videoId;

        recipeDetailsDiv.innerHTML = `
          <h1 class="font-extrabold text-3xl mb-4">${recipe.strMeal}</h1>
          <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="w-full rounded-lg mb-4">
          <p class="text-lg mb-4"><strong>Area:</strong> ${recipe.strArea}</p>
          <p class="text-lg mb-4"><strong>Ingredients:</strong></p>
          <ul class="list-disc list-inside mb-4">
            ${ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
          </ul>
          <p class="text-lg mb-4">${recipe.strInstructions}</p>
          <div class="flex justify-center mt-4">
            <iframe width="560" height="315" src="https://www.youtube.com/embed/${cleanVideoId}" frameborder="0" allowfullscreen></iframe>
          </div>
        `;
      } else {
        console.error('Recipe details not found.');
      }
    } catch (error) {
      console.error('Error displaying recipe details:', error);
    }
  }

  async function fetchAndDisplayCountries() {
    try {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list');
      if (!response.ok) {
        throw new Error(`HTTP-Error: ${response.status}`);
      }
      const data = await response.json();
      const countries = data.meals;

      buttonsContainer.innerHTML = '';

      countries.forEach(country => {
        const countryButton = document.createElement('button');
        countryButton.className = 'w-20 hover:border hover:border-slate-900 transition-all  focus:border-slate-900 focus:border ';
        countryButton.textContent = country.strArea;
        countryButton.addEventListener('click', () => {
          getFilteredRecipesByCountry(country.strArea);
        });
        buttonsContainer.appendChild(countryButton);
      });
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  }

  async function getFilteredRecipesByCountry(country) {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${country}`);
      if (!response.ok) {
        throw new Error(`HTTP-Error: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);

      RecGrid.innerHTML = '';

      data.meals.forEach(meal => {
        RecGrid.innerHTML += `
          <div class="bg-white space-y-3 relative p-4 rounded-lg shadow-lg">
            <img src="${meal.strMealThumb}" alt="food" class="w-full rounded-t-lg">
            <h2 class="pl-2 font-bold text-xl">${meal.strMeal}</h2>
            <button class="recipe-btn bg-amber-700 hover:bg-amber-500 w-full p-2 rounded-2xl font-bold" data-meal-id="${meal.idMeal}">View Recipe</button>
            <button class="favorite-btn bg-amber-700 hover:bg-amber-500 w-full p-2 rounded-2xl font-bold" data-meal-id="${meal.idMeal}" data-meal-name="${meal.strMeal}" data-meal-thumb="${meal.strMealThumb}">Favorite</button>
          </div>`;
      });

      const recipeButtons = document.querySelectorAll(".recipe-btn");
      recipeButtons.forEach(button => {
        button.addEventListener("click", async function() {
          const mealId = button.getAttribute("data-meal-id");
          await showRecipeDetails(mealId);
          recipeDSection.scrollIntoView({ behavior: 'smooth' });
        });
      });

      const favoriteButtons = document.querySelectorAll(".favorite-btn");
      favoriteButtons.forEach(button => {
        button.addEventListener("click", function() {
          const mealId = button.getAttribute("data-meal-id");
          const mealName = button.getAttribute("data-meal-name");
          const mealThumb = button.getAttribute("data-meal-thumb");
          saveFavoriteRecipe({ id: mealId, name: mealName, thumb: mealThumb });
        });
      });
    } catch (error) {
      console.error("Error fetching data", error.message);
    }
  }

  searchBtn.addEventListener("click", function() {
    const ingredient = searchInput.value.trim();
    if (ingredient) {
      getFilteredRecipes(ingredient);
    }
  });


  getFilteredRecipes('chicken_breast');
  fetchAndDisplayCountries();
});
