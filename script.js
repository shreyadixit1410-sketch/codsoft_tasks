// ===============================
// QUOTE OF THE DAY - TASK 2
// ===============================

const quotes = [
    {
        text: "The best way to predict the future is to create it.",
        author: "Peter Drucker"
    },
    {
        text: "Success is the sum of small efforts, repeated day in and day out.",
        author: "Robert Collier"
    },
    {
        text: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt"
    },
    {
        text: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson"
    },
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
    },
    {
        text: "It always seems impossible until it's done.",
        author: "Nelson Mandela"
    },
    {
        text: "Dream big and dare to fail.",
        author: "Norman Vincent Peale"
    },
    {
        text: "Great things are done by a series of small things brought together.",
        author: "Vincent van Gogh"
    },
    {
        text: "Your limitation is only your imagination.",
        author: "Unknown"
    },
    {
        text: "The future depends on what you do today.",
        author: "Mahatma Gandhi"
    }
];


// ===============================
// GET HTML ELEMENTS
// ===============================

const quoteElement = document.getElementById("quote");
const authorElement = document.getElementById("author");

const newQuoteButton = document.getElementById("newQuote");
const favoriteButton = document.getElementById("favoriteBtn");
const copyButton = document.getElementById("copyBtn");
const shareButton = document.getElementById("shareBtn");

const favoritesList = document.getElementById("favoritesList");


// ===============================
// VARIABLES
// ===============================

let currentQuote = quotes[0];

let favorites = JSON.parse(
    localStorage.getItem("favorites")
) || [];


// ===============================
// DISPLAY QUOTE
// ===============================

function displayQuote(quote) {

    currentQuote = quote;

    quoteElement.textContent = quote.text;

    authorElement.textContent =
        "— " + quote.author;

    updateFavoriteButton();
}


// ===============================
// NEW RANDOM QUOTE
// ===============================

function getRandomQuote() {

    let randomIndex =
        Math.floor(Math.random() * quotes.length);

    displayQuote(quotes[randomIndex]);
}


// ===============================
// ADD TO FAVORITES
// ===============================

function addFavorite() {

    const alreadyFavorite = favorites.some(
        function (item) {
            return item.text === currentQuote.text;
        }
    );

    if (alreadyFavorite) {

        alert("This quote is already in your favorites!");

        return;
    }

    favorites.push(currentQuote);

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    displayFavorites();

    updateFavoriteButton();
}


// ===============================
// REMOVE FROM FAVORITES
// ===============================

function removeFavorite(index) {

    favorites.splice(index, 1);

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    displayFavorites();

    updateFavoriteButton();
}


// ===============================
// UPDATE FAVORITE BUTTON
// ===============================

function updateFavoriteButton() {

    const isFavorite = favorites.some(
        function (item) {
            return item.text === currentQuote.text;
        }
    );

    if (isFavorite) {

        favoriteButton.textContent =
            "💖 Favorited";

    } else {

        favoriteButton.textContent =
            "❤️ Favorite";
    }
}


// ===============================
// DISPLAY FAVORITES
// ===============================

function displayFavorites() {

    favoritesList.innerHTML = "";

    if (favorites.length === 0) {

        favoritesList.innerHTML =
            '<p class="empty">No favorite quotes yet.</p>';

        return;
    }

    favorites.forEach(
        function (quote, index) {

            const item =
                document.createElement("div");

            item.className = "favorite-item";

            const quoteText =
                document.createElement("p");

            quoteText.className = "favorite-text";

            quoteText.textContent =
                '"' + quote.text + '"';

            const author =
                document.createElement("p");

            author.className = "favorite-author";

            author.textContent =
                "— " + quote.author;

            const removeButton =
                document.createElement("button");

            removeButton.className = "remove-btn";

            removeButton.textContent = "Remove";

            removeButton.addEventListener(
                "click",
                function () {
                    removeFavorite(index);
                }
            );

            item.appendChild(quoteText);
            item.appendChild(author);
            item.appendChild(removeButton);

            favoritesList.appendChild(item);
        }
    );
}


// ===============================
// COPY QUOTE
// ===============================

function copyQuote() {

    const text =
        '"' +
        currentQuote.text +
        '" — ' +
        currentQuote.author;

    const textarea =
        document.createElement("textarea");

    textarea.value = text;

    document.body.appendChild(textarea);

    textarea.select();

    document.execCommand("copy");

    document.body.removeChild(textarea);

    alert("Quote copied successfully! 📋");
}


// ===============================
// SHARE QUOTE
// ===============================

function shareQuote() {

    const text =
        '"' +
        currentQuote.text +
        '" — ' +
        currentQuote.author;

    const whatsappURL =
        "https://wa.me/?text=" +
        encodeURIComponent(text);

    window.open(whatsappURL);
}


// ===============================
// BUTTON EVENTS
// ===============================

newQuoteButton.addEventListener(
    "click",
    getRandomQuote
);

favoriteButton.addEventListener(
    "click",
    addFavorite
);

copyButton.addEventListener(
    "click",
    copyQuote
);

shareButton.addEventListener(
    "click",
    shareQuote
);


// ===============================
// START APP
// ===============================

displayQuote(currentQuote);

displayFavorites();