// ===============================
// DOM ELEMENTS
// ===============================

const searchBtn = document.getElementById("btn");
const searchBox = document.getElementById("box");

const errorContainer = document.getElementById("error-container");
const resultHeading = document.getElementById("result-heading");

const mealsContainer = document.getElementById("meals");

const detailsContainer = document.getElementById("meals-container");
const detailsContent = document.querySelector(".meal-details-content");

const backBtn = document.getElementById("back-btn");

// ===============================
// API URLS
// ===============================

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

const SEARCH_URL = `${BASE_URL}/search.php?s=`;

const LOOKUP_URL = `${BASE_URL}/lookup.php?i=`;

// ===============================
// EVENT LISTENERS
// ===============================

searchBtn.addEventListener("click", searchMeals);

searchBox.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchMeals();
  }
});

mealsContainer.addEventListener("click", handleMealClick);

backBtn.addEventListener("click", () => {
  detailsContainer.classList.add("hidden");

  mealsContainer.classList.remove("hidden");

  resultHeading.classList.remove("hidden");
});

// ===============================
// SEARCH RECIPES
// ===============================

async function searchMeals() {
  // Get text from input
  const searchTerm = searchBox.value.trim();

  // Check if input is empty
  if (!searchTerm) {
    errorContainer.textContent = "Please enter a recipe name.";

    errorContainer.classList.remove("hidden");

    return;
  }

  try {
    // Show loading message
    resultHeading.textContent = `Searching for "${searchTerm}"...`;
 
    // Clear old results
    mealsContainer.innerHTML = "";

    // Hide previous error
    errorContainer.classList.add("hidden");

    // Fetch recipes from API
    const response = await fetch(
      `${SEARCH_URL}${encodeURIComponent(searchTerm)}`,
    );

    // Check response
    if (!response.ok) {
      throw new Error("Failed to fetch recipes");
    }

    // Convert response to JSON
    const data = await response.json();

    console.log("API Data:", data);

    // Check whether recipes not exist
    if (!data.meals) {
      resultHeading.textContent = "";

      errorContainer.textContent = `No recipes found for "${searchTerm}". Try another search!`;

      errorContainer.classList.remove("hidden");

      return;
    }

    // Show result heading
    resultHeading.textContent = `Search results for "${searchTerm}":`;

    // Display recipes
    displayMeals(data.meals);

    // Clear input
    searchBox.value = "";
  } catch (error) {
    console.error(error);

    errorContainer.textContent = "Something went wrong. Please try again!";

    errorContainer.classList.remove("hidden");
  }
}

// ===============================
// DISPLAY RECIPE CARDS
// ===============================

function displayMeals(meals) {
  mealsContainer.innerHTML = "";

  meals.forEach((meal) => {
    mealsContainer.innerHTML += `

            <div class="meal" data-meal-id="${meal.idMeal}">

                <img
                    src="${meal.strMealThumb}"
                    alt="${meal.strMeal}"
                >

                <div class="meal-info">

                    <h3 class="meal-title">
                        ${meal.strMeal}
                    </h3>

                    ${
                      meal.strCategory
                        ?`<div class="meal-category">
                                ${meal.strCategory}
                           </div>`
                        : ""
                    }

                </div> 

            </div>

        `;
  });
}

// ===============================
// HANDLE RECIPE CARD CLICK
// ===============================

async function handleMealClick(e) {
  // Find clicked recipe card
  const mealElement = e.target.closest(".meal");

  // If user clicked somewhere else
  if (!mealElement) {
    return;
  }

  // Get recipe ID
  const mealId = mealElement.getAttribute("data-meal-id");

  try {
    // Fetch complete recipe information
    const response = await fetch(`${LOOKUP_URL}${mealId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch recipe details");
    }

    const data = await response.json();

    console.log("Recipe details:", data);

    // Make sure recipe exists
    if (!data.meals || !data.meals[0]) {
      return;
    }

    const meal = data.meals[0];

    // ===============================
    // GET INGREDIENTS
    // ===============================

    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];

      const measure = meal[`strMeasure${i}`];

      if (ingredient && ingredient.trim() !== "") {
        ingredients.push({
          ingredient: ingredient,
          measure: measure || "",
        });
      }
    }

    // ===============================
    // DISPLAY RECIPE DETAILS
    // ===============================

    detailsContent.innerHTML = `

            <img
                class="meal-details-img"
                src="${meal.strMealThumb}"
                alt="${meal.strMeal}"
            >


            <h2>${meal.strMeal}</h2>


            <div class="meal-details-category">

                <span>
                    ${meal.strCategory || "Recipe"}
                </span>

            </div>


            <h3>Ingredients</h3>


            <ul class="ingredients-list">

                ${ingredients
                  .map(
                    (item) => `

                    <li>

                        <i class="fas fa-check"></i>

                        ${item.measure}
                        ${item.ingredient}

                    </li>

                `,
                  )
                  .join("")}

            </ul>


            <h3>Instructions</h3>


            <p class="meal-details-instructions">
                ${meal.strInstructions}
            </p>


            ${
              meal.strYoutube
                ? `
                    <a
                        class="youtube-link"
                        href="${meal.strYoutube}"
                        target="_blank"
                    >
                        <i class="fab fa-youtube"></i>
                        Watch on YouTube
                    </a>
                `
                : ""
            }

        `;

    // Hide recipe cards
    mealsContainer.classList.add("hidden");

    // Hide search heading
    resultHeading.classList.add("hidden");

    // Show details
    detailsContainer.classList.remove("hidden");
  } catch (error) {
    console.error(error);

    errorContainer.textContent = "Unable to load recipe details.";

    errorContainer.classList.remove("hidden");
  }
}
