const SEARCH_API_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const RANDOM_API_URL = "https://www.themealdb.com/api/json/v1/1/random.php";
const LOOKUP_API_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
const LOCAL_API_URL = "http://localhost:3001/recipes";

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsGrid = document.getElementById("search-results");
const messageArea = document.getElementById("message-area");
const addRecipeBtn = document.getElementById("add-recipe-button");
const addForm = document.getElementById("add-recipe-form");
const cancelAddBtn = document.getElementById("cancel-add-recipe");
const modal = document.getElementById("recipe-modal");
const modalContent = document.getElementById("recipe-details-content");
const modalCloseBtn = document.querySelector(".recipe-detail-btn");

// Show/hide Add Recipe form
addRecipeBtn.addEventListener("click", () => {
  addForm.classList.remove("hidden");
  addRecipeBtn.style.display = "none";
  clearMessage();
});

cancelAddBtn.addEventListener("click", () => {
  addForm.classList.add("hidden");
  addRecipeBtn.style.display = "inline-block";
  addForm.reset();
  clearMessage();
});

// Search TheMealDB recipes
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    searchRecipes(searchTerm);
  } else {
    showMessage("Please enter a search term", true);
  }
});

// Click on a recipe item to get details or delete local recipe
resultsGrid.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    deleteLocalRecipe(e.target.dataset.id);
  } else {
    const card = e.target.closest(".recipe-item");
    if (card) {
      const recipeId = card.dataset.id;
      const source = card.dataset.source || "api";
      fetchRecipeDetails(recipeId, source);
    }
  }
});

// Modal close events consolidated
function handleModalClose(e) {
  if (e.target === modal || e.target === modalCloseBtn) {
    closeModal();
  }
}

modalCloseBtn.addEventListener("click", handleModalClose);
modal.addEventListener("click", handleModalClose);

// Show messages in the UI
function showMessage(message, isError = false, isLoading = false) {
  messageArea.textContent = message;
  messageArea.className = "message";
  if (isError) messageArea.classList.add("error");
  if (isLoading) messageArea.classList.add("loading");
}

function clearMessage() {
  messageArea.textContent = "";
  messageArea.className = "message";
}

// Fetch search results from TheMealDB API
async function searchRecipes(query) {
  showMessage(`Searching for "${query}"...`, false, true);
  resultsGrid.innerHTML = "";

  try {
    const response = await fetch(`${SEARCH_API_URL}${query}`);
    if (!response.ok) throw new Error("Network error");
    const data = await response.json();
    clearMessage();

    if (data.meals) {
      displayRecipes(data.meals, "api");
    } else {
      showMessage(`No recipes found for "${query}"`, true);
    }
  } catch {
    showMessage("Something went wrong. Please try again.", true);
  }
}

// Display recipes in the grid (API or local)
function displayRecipes(recipes, source = "api") {
  if (!recipes || recipes.length === 0) {
    showMessage("No recipes to display");
    return;
  }

  resultsGrid.innerHTML = "";
  recipes.forEach((recipe) => {
    const recipeDiv = document.createElement("div");
    recipeDiv.classList.add("recipe-item");
    recipeDiv.dataset.id = source === "api" ? recipe.idMeal : recipe.id;
    recipeDiv.dataset.source = source;

    recipeDiv.innerHTML = `
      <img src="${source === "api" ? recipe.strMealThumb : recipe.image}" alt="${source === "api" ? recipe.strMeal : recipe.name}" loading="lazy">
      <h3>${source === "api" ? recipe.strMeal : recipe.name}</h3>
      ${source === "local" ? `<button class="delete-btn" data-id="${recipe.id}">Delete</button>` : ""}
    `;

    resultsGrid.appendChild(recipeDiv);
  });
}

// Consolidated fetch details function for API/local recipes
async function fetchRecipeDetails(id, source) {
  modalContent.innerHTML = '<p class="message loading">Loading details...</p>';
  showModal();

  let url = source === "api" ? `${LOOKUP_API_URL}${id}` : `${LOCAL_API_URL}/${id}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch recipe details.");
    const data = await response.json();

    // For API data, meals array; for local, direct object
    if (source === "api") {
      if (data.meals && data.meals.length > 0) {
        displayRecipeDetails(data.meals[0]);
      } else {
        modalContent.innerHTML = '<p class="message error">Could not load recipe details.</p>';
      }
    } else {
      displayRecipeDetails(data);
    }
  } catch {
    modalContent.innerHTML = '<p class="message error">Failed to load recipe details. Check your connection or try again.</p>';
  }
}

// Display recipe details in modal (handles both API and local format)
function displayRecipeDetails(recipe) {
  let ingredientsHTML = "";

  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    // local recipe format
    ingredientsHTML = `<ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>`;
  } else {
    // API recipe format
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`]?.trim();
      const measure = recipe[`strMeasure${i}`]?.trim();
      if (ingredient && ingredient.length > 0) {
        ingredients.push(`<li>${measure ? measure + " " : ""}${ingredient}</li>`);
      }
    }
    ingredientsHTML = `<ul>${ingredients.join("")}</ul>`;
  }

  modalContent.innerHTML = `
    <h2>${recipe.name || recipe.strMeal}</h2>
    <img src="${recipe.image || recipe.strMealThumb}" alt="${recipe.name || recipe.strMeal}" />
    <h3>Ingredients</h3>
    ${ingredientsHTML}
    <h3>Instructions</h3>
    <p>${(recipe.instructions || recipe.strInstructions || "").replace(/\r?\n/g, "<br>")}</p>
  `;
}

// Show/hide modal helpers
function showModal() {
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

// Add new recipe handler
if (addForm) {
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("custom-name").value.trim();
    const ingredientsRaw = document.getElementById("custom-ingredients").value.trim();
    const instructions = document.getElementById("custom-instructions").value.trim();
    const image = document.getElementById("custom-image").value.trim() || "https://via.placeholder.com/300x200.png?text=No+Image";

    if (!name || !ingredientsRaw || !instructions) {
      alert("Please fill in all required fields.");
      return;
    }

    // Ingredients array 
    const ingredients = ingredientsRaw.split(",").map(i => i.trim());

    const newRecipe = { name, ingredients, instructions, image };

    try {
      const res = await fetch(LOCAL_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecipe),
      });
      if (!res.ok) throw new Error("Failed to add recipe.");

      addForm.reset();
      addForm.classList.add("hidden");
      addRecipeBtn.style.display = "inline-block";
      showMessage("Recipe added successfully!");
      fetchLocalRecipes();
    } catch {
      showMessage("Failed to add recipe. Try again.", true);
    }
  });
}

// Fetch and display all local recipes
async function fetchLocalRecipes() {
  try {
    const res = await fetch(LOCAL_API_URL);
    if (!res.ok) throw new Error("Failed to fetch local recipes.");
    const data = await res.json();
    displayRecipes(data, "local");
  } catch (error) {
    console.error(error);
  }
}

// Delete local recipe
async function deleteLocalRecipe(id) {
  try {
    const res = await fetch(`${LOCAL_API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete recipe.");
    showMessage("Recipe deleted.");
    fetchLocalRecipes();
  } catch {
    showMessage("Failed to delete recipe.", true);
  }
}

// Initial load: fetch and show local recipes
fetchLocalRecipes();

// Light and dark mode toggle button
const themeToggleBtn = document.getElementById('theme-toggle-btn');
themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});
