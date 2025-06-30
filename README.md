## Recipe Finder App

The Recipe Finder is a simple web application that allows users to search for recipes, view detailed cooking instructions, and even add their own custom recipes. It fetches data from [TheMealDB API](https://www.themealdb.com/api.php) and also supports storing custom recipes locally using `json-server`.

## Features
Search Recipes by name from TheMealDB.
Get a Random Recipe from the database.
Add Your Own Recipes using a simple form.
View Detailed Recipe Instructions and ingredients.
Delete Custom Recipes from local storage.

## Setup Instructions

1. Clone the repository
   git clone https://github.com/your-username/recipe-finder.git
   cd recipe-finder

2. Install json-server

   npm install -g json-server

3. Start the backend API by running
   json-server --watch db.json --port 3000

4. Open the application

   Open index.html in your web browser.

## API Endpoints

GET /recipes – Fetch all custom recipes

POST /recipes – Create a new custom recipe

PATCH /recipes/:id – Update a specific custom recipe

DELETE /recipes/:id – Delete a specific custom recipe


   
## Technologies Used
Html
Css
Javascript
TheMealDB API
json-server for local backend (custom recipes)


## Folder Structure

RECIPE FINDER

├── db.json           # JSON database

├── index.html        # Main HTML file

├── index.js          # JavaScript functionality

├── README.md         # Detailed project documentation

└── style.css         # Stylesheet for responsive design


## License
MIT License
Copyright © 2025 Annet Nyabuto

You are free to use, modify, and distribute this project for educational purposes only.

