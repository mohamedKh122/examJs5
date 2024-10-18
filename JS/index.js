// Side bar toggle
document.querySelector(".openIcon").addEventListener("click", function () {
    document.querySelector(".sideBar .barContent").style.left = "0";
    document.querySelector(".sideBar .barFun").style.left = "250px";
    this.classList.add("d-none");
    document.querySelector(".closeIcon").classList.remove("d-none");
});

document.querySelector(".closeIcon").addEventListener("click", function () {
    document.querySelector(".sideBar .barContent").style.left = "-200px";
    document.querySelector(".sideBar .barFun").style.left = "0";
    this.classList.add("d-none");
    document.querySelector(".openIcon").classList.remove("d-none");
});

async function getApi(input) {
    try {
        const myAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/${input}`);
        if (!myAPI.ok) {
            throw new Error("Failed to fetch");
        }
        const data = await myAPI.json();
        return data.meals;
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function getRandomMeals() {
    let mainArray = [];
    for (let i = 0; i < 20; i++) {
        mainArray.push(getApi("random.php"));
    }
    let meals = await Promise.all(mainArray);
    meals = meals.flat();
    displayMeals(meals);
}

function displayMeals(arr) {
    let output = ``;
    for (let i = 0; i < arr.length; i++) {
        output += `<div class="col-md-3 p-1 rounded-3 meal-card" data-meal-id="${arr[i].idMeal}">
                    <div class="cardMeal position-relative overflow-hidden">
                        <img class="rounded-4" src="${arr[i].strMealThumb}" alt="${arr[i].strMeal}">
                        <div class="layerContent position-absolute p-4 rounded-3">
                            <h3>${arr[i].strMeal}</h3>
                        </div>
                    </div>
                </div>`;
    }
    document.getElementById("MealsHomeRow").innerHTML = output;

    document.querySelectorAll(".meal-card").forEach(function (card) {
        card.addEventListener("click", function () {
            let mealId = this.getAttribute("data-meal-id");
            goToDetailsPage(mealId);
        });
    });
}

getRandomMeals();

function goToDetailsPage(mealId) {
    localStorage.setItem("mealId", mealId);
    window.location = "details.html";
}

async function displaySingleMeal(mealId) {
    let singleMeal = await getApi(`lookup.php?i=${mealId}`);
    if (singleMeal && singleMeal.length > 0) {
        singleMeal = singleMeal[0];
        let tagsArray = singleMeal.strTags ? singleMeal.strTags.split(",") : [];
        let tagsHTML = tagsArray.map(tag =>
            `<span class="bg-info p-2 rounded-3 m-1">${tag}</span>`
        ).join("");

        let ingredientsArray = [];
        for (let i = 1; i <= 20; i++) {
            if (singleMeal[`strIngredient${i}`]) {
                ingredientsArray.push(`${singleMeal[`strIngredient${i}`]} ${singleMeal[`strMeasure${i}`]}`);
            }
        }
        let ingredientsHTML = ingredientsArray.map(ingredient =>
            `<span class="bg-secondary text-white p-2 rounded-3 m-2">${ingredient}</span>`
        ).join("");

        let output = `
            <div class="container">
                <div class="row">
                    <div class="col-md-5">
                        <div class="mainInfo rounded-3">
                            <img class="rounded-3 w-100" src="${singleMeal.strMealThumb}" alt="${singleMeal.strMeal}">
                            <h1 class="text-center mt-3">${singleMeal.strMeal}</h1>
                        </div>
                    </div>
                    <div class="col-md-7">
                        <div class="secondInfo">
                            <h2>Instructions</h2>
                            <p>${singleMeal.strInstructions}</p>
                            <div class="smallInfo">
                                <h3 class="d-inline-block">Area:</h3>
                                <span class="fs-4"> ${singleMeal.strArea}</span>
                            </div>
                            <div class="smallInfo">
                                <h3 class="d-inline-block">Category:</h3>
                                <span class="fs-4"> ${singleMeal.strCategory}</span>
                            </div>
                            <div class="smallInfo">
                                <h3>Recipes:</h3>
                                <div class="recipes d-flex flex-wrap g-3">
                                    ${ingredientsHTML}
                                </div>
                            </div>
                            <div class="smallInfo">
                                <h3>Tags:</h3>
                                <div class="tags d-flex flex-wrap g-3">
                                    ${tagsHTML}
                                </div>
                            </div>
                            <div class="sources mt-4 ms-1">
                                <span class="bg-success p-2 rounded-3"><a class="text-white" href="${singleMeal.strSource}">Source</a></span>
                                <span class="bg-danger p-2 rounded-3"><a class="text-white" href="${singleMeal.strYoutube}">YouTube</a></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        document.getElementById("singleMealDetails").innerHTML = output;
    }
}

if (document.getElementById("singleMealDetails")) {
    const mealId = localStorage.getItem("mealId");
    if (mealId) {
        displaySingleMeal(mealId);
    } else {
        console.log("No meal Id in local storage");
    }
}

let inputByLetter = document.querySelector("#searchByLetter");
let inputByName = document.querySelector("#searchByName");
if (window.location.pathname.endsWith("search.html")) {
    inputByName.addEventListener("input", function(){
        let searchValue = inputByName.value.toLowerCase();
        displaySearchedMeals(searchValue, "search.php?s=");
    });

    inputByLetter.addEventListener("input", function () {
        let searchValue = inputByLetter.value.toLowerCase();
        if (searchValue.length === 1) {
            displaySearchedMeals(searchValue, "search.php?f=");
        } else {
            document.getElementById("MealsHomeRow").innerHTML = "<p>Please enter a single letter</p>";
        }
    });
}

async function displaySearchedMeals(letter, apiVal) {
    let meals = await getApi(`${apiVal}${letter}`);
    if (meals && meals.length > 0) {
        displayMeals(meals);
    } else {
        document.getElementById("MealsHomeRow").innerHTML = '<p>No meals found</p>';
    }
}

if (window.location.pathname.endsWith("search.html")) {
    console.log("We Are IN Category Page");
    displayCat();
} 

async function displayCategories() { 
    try {
        const myAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/categories.php`);
        if (!myAPI.ok) {
            throw new Error("Failed to fetch");
        }
        const data = await myAPI.json();
        return data.categories;
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function displayCat() {
    let cat = await displayCategories(); 
    if (cat) {
        let output = ``;
        for (let i = 0; i < cat.length; i++) {
            output += `<div class="col-md-3 p-4 rounded-3 meal-card" data-cat-str="${cat[i].strCategory}">
                        <div class="cardMeal position-relative overflow-hidden">
                            <img class="rounded-4" src="${cat[i].strCategoryThumb}" alt="${cat[i].strCategory}">
                            <div class="layerContent position-absolute p-4 rounded-3">
                                <h3>${cat[i].strCategory}</h3>
                            </div>
                        </div>
                    </div>`;
        }
        document.getElementById("MealsHomeRow").innerHTML = output;

        document.querySelectorAll(".meal-card").forEach(function (card) {
            card.addEventListener("click", function () {
                goToCategoryMeals(card.getAttribute("data-cat-str"));
            });
        });
    }
}

async function goToCategoryMeals(input) {
    let categoryMealsInfo = await getApi(`filter.php?c=${input}`);
    displayMeals(categoryMealsInfo);
}

async function displayArea() {
    let areas = await getApi("list.php?a=list");
    let output = ``;
    for (let i = 0; i < areas.length; i++) {
        output += `<div class="col-md-3 justify-content-center mt-2" data-area="${areas[i].strArea}">
        <div class="item d-flex align-items-center flex-column">
        <i class="fa-solid fa-house-laptop fa-4x text-white"></i>
        <h3 class="text-white">${areas[i].strArea}</h3>
        </div>
        </div>`;
    }

    document.querySelector("#MealsHomeRow").innerHTML = output;

    document.querySelectorAll(".item").forEach(function (item) {
        item.addEventListener("click", function () {
            goToAreaMeals(item.parentElement.getAttribute("data-area"));
        });
    });
}

async function goToAreaMeals(area) {
    let areaMeals = await getApi(`filter.php?a=${area}`);
    displayMeals(areaMeals);
}

async function displayIngredients() {
    let ingredients = await getApi("list.php?i=list");
    let output = ``;
    for (let i = 0; i < ingredients.length; i++) {
        output += `<div class="col-md-3 justify-content-center mt-2" data-ingredient="${ingredients[i].strIngredient}">
        <div class="item d-flex align-items-center flex-column">
        <i class="fa-solid fa-drumstick-bite fa-4x text-white"></i>
        <h3 class="text-white">${ingredients[i].strIngredient}</h3>
        </div>
        </div>`;
    }
    document.querySelector("#MealsHomeRow").innerHTML = output;

    document.querySelectorAll(".item").forEach(function (item) {
        item.addEventListener("click", function () {
            goToIngredientMeals(item.parentElement.getAttribute("data-ingredient"));
        });
    });
}

async function goToIngredientMeals(ingredient) {
    let ingredientMeals = await getApi(`filter.php?i=${ingredient}`);
    displayMeals(ingredientMeals);
}

if (window.location.pathname.endsWith("area.html")) {
    displayArea();
}
if (window.location.pathname.endsWith("ingredient.html")) {
    displayIngredients();
}
