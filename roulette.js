"use strict";

const HARD = 20;
const MED = 15;
const EASY = 10;

var resultsTable = document.getElementById("results-div").children[0];
var suButton = document.getElementById("straight");
var splitButton = document.getElementById("split");
var streetButton = document.getElementById("street");
var cornerButton = document.getElementById("corner");
var mixButton = document.getElementById("mix");

var hardButton = document.getElementById("hard");
var medButton = document.getElementById("med");
var easyButton = document.getElementById("easy");

var form = document.getElementById("input-results").children[0];

class Game {
    operands = []
    #state = 0;

    constructor(diff = EASY, bet = "straight") {
        this.difficulty = diff;
        this.bet = bet;

        for (let i = 0; i < this.difficulty; i++) {
            let op = this.#genOperand();

            while (this.operands.includes(op)) {
                op = this.#genOperand()
            }

            this.operands.push(op);
        }

        console.log(this.operands)
    }

    #genOperand() {
        return Math.ceil(Math.random() * this.difficulty);
    }

    verify(answer) {
        return answer == this.table * this.operands[this.#state];
    }

    get table() {
        let r = 0;

        switch (this.bet) {
            case "straight":
                r = 35;
                break;
            case "split":
                r = 17;
                break;
            case "corner":
                r = 8;
                break;
            case "street":
                r = 11;
                break;
        }

        return r;
    }

    next() {
        this.#state++;

        // Wrap around
        if (this.#state >= this.operands.length) {
            this.#state = 0;
        }

        return this.getQuestion();
    }

    getQuestion() {
        return this.operands[this.#state];
    }
}

let chips = [];
let activeButtonHolder = {
    type: null,
    mode: null,
}

function addChip(value, betType) {
    removeChips();

    let chip = document.createElement("div");
    chip.setAttribute("id", "chip");
    chip.className = betType;
    chip.innerHTML = value;
    document.getElementById("board-grid").appendChild(chip);
    chips.push(chip);
}

function removeChips() {
    for (let i = 0; i < chips.length; i++) {
        let chip = chips[i];
        chip.remove();
    }

    chips = [];
}

function setActive(button, mode = false) {
    button.className = "active";
    if (mode)
        activeButtonHolder.mode = button;
    else
        activeButtonHolder.type = button;
}

function setInactive(mode = false) {
    if (mode) {
        let button = activeButtonHolder.mode;
        button.classList.remove("active");
        activeButtonHolder.mode = null;
    }
    else {
        let button = activeButtonHolder.type;
        button.classList.remove("active");
        activeButtonHolder.type = null;
    }

}

// Set up

setActive(suButton);
setActive(easyButton, true);

let game = new Game(EASY, "straight");

let gameRow = document.getElementsByClassName("button-box")[0];
let modeRow = document.getElementsByClassName("button-box")[1];

function buttonListener(event, mode = false) {
    let btn = event.target;

    setInactive(mode);
    setActive(btn, mode);

    if (mode) {
        switch (btn.id) {
            case "easy":
                game = new Game(EASY, game.bet);
                break;
            case "med":
                game = new Game(MED, game.bet);
                break;
            case "hard":
                game = new Game(HARD, game.bet);
                break;
        }
    } else {
        console.log(btn.id);
        game = new Game(game.difficulty, btn.id);
    }

    removeChips();
    addChip(game.getQuestion(), game.bet)
}

for (let i = 0; i < gameRow.childNodes.length; i++) {
    let btn = gameRow.childNodes[i];
    btn.addEventListener("click", function (e) {
        buttonListener(e);
    });
}

for (let i = 0; i < modeRow.childNodes.length; i++) {
    let btn = modeRow.childNodes[i];
    btn.addEventListener("click", function (e) {
        buttonListener(e, true);
    });
}

form.addEventListener("submit", function (e) {
    e.preventDefault();

    let answer = form.elements["answer"].value;

    if (answer.length > 0) {
        let row = resultsTable.insertRow();
        row.insertCell().innerHTML = `${game.table} \u00D7 ${game.getQuestion()}`;
        row.insertCell().innerHTML = answer;

        if (game.verify(answer)) {
            game.next();

            row.insertCell().innerHTML = "Correct!";

            addChip(game.getQuestion(), game.bet);
        } else {
            row.insertCell().innerHTML = "Wrong!";
        }

        form.elements["answer"].value = "";
    }
});

addChip(game.getQuestion(), "straight");