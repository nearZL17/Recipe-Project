document.addEventListener("DOMContentLoaded", function() {
    const favoritesContainer = document.querySelector("#favoritesContainer");
    const recipeDetailsDiv = document.querySelector("#recipeDetails");
    const recipeDSection = document.querySelector("#recipeD");
  
    function loadFavoriteRecipes() {
      const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      favoritesContainer.innerHTML = '';
  
      if (favorites.length === 0) {
        favoritesContainer.innerHTML = '<p>No favorite recipes yet!</p>';
        return;
      }
  
      favorites.forEach(recipe => {
        favoritesContainer.innerHTML += `
          <div class="bg-white space-y-3 relative p-4 rounded-lg shadow-lg">
            <img src="${recipe.thumb}" alt="food" class="w-full rounded-t-lg">
            <h2 class="pl-2 font-bold text-xl">${recipe.name}</h2>
            <button class="recipe-btn bg-amber-700 hover:bg-amber-500 w-full p-2 rounded-2xl font-bold" data-meal-id="${recipe.id}">View Recipe</button>
            <button class="remove-favorite-btn bg-red-700 hover:bg-red-500 w-full p-2 rounded-2xl font-bold" data-meal-id="${recipe.id}">Remove</button>
          </div>`;
      });
  
      const viewRecipeButtons = document.querySelectorAll(".recipe-btn");
      viewRecipeButtons.forEach(button => {
        button.addEventListener("click", async function() {
          const mealId = button.getAttribute("data-meal-id");
          await showRecipeDetails(mealId);
          recipeDSection.scrollIntoView({ behavior: 'smooth' });
        });
      });
  
      const removeFavoriteButtons = document.querySelectorAll(".remove-favorite-btn");
      removeFavoriteButtons.forEach(button => {
        button.addEventListener("click", function() {
          const mealId = button.getAttribute("data-meal-id");
          removeFavoriteRecipe(mealId);
        });
      });
    }
  
    function removeFavoriteRecipe(mealId) {
      let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      favorites = favorites.filter(fav => fav.id !== mealId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      loadFavoriteRecipes();
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
  
    loadFavoriteRecipes();
  });
  