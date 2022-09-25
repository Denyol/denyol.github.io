"use strict";
import { Game, GameMix } from './game.js';

const HARD = 20;
const MED = 15;
const EASY = 10;

$(function () {
    // Document constants
    const resultsTable = $("table");
    const suButton = $("#straight");
    const splitButton = document.getElementById("split");
    const streetButton = document.getElementById("street");
    const cornerButton = document.getElementById("corner");
    const mixButton = document.getElementById("mix");

    const hardButton = document.getElementById("hard");
    const medButton = document.getElementById("med");
    const easyButton = $("#easy");

    const form = $("form");

    const gameRow = $(".button-box").first();
    const modeRow = $(".button-box").eq(1);

    let chips = [];
    let activeButtonHolder = {
        type: null,
        mode: null,
    }

    // Set up
    setActive(suButton);
    setActive(easyButton, true);

    let game = new Game(EASY, "straight");

    addChips(game);

    // Add a single chip
    function addChip(type, value) {
        let chip = document.createElement("div");
        chip.setAttribute("id", "chip");
        chip.className = type;
        chip.innerHTML = value;
        document.getElementById("board-grid").appendChild(chip);
        chips.push(chip);
    }

    function addChips(game) {
        if (game instanceof GameMix) {
            if (game.straightUps > 0)
                addChip("straight", game.straightUps);

            if (game.streets > 0)
                addChip("street", game.streets);

            if (game.splits > 0) {
                let split1 = Math.ceil(Math.random() * game.splits);
                let split2 = game.splits - split1;

                if (split1 > 0)
                    addChip("split", split1);

                if (split2 > 0) {
                    addChip("split2", split2);
                }
            }

            if (game.corners > 0) {
                let corner1 = Math.ceil(Math.random() * game.corners);
                let corner2 = game.corners - corner1;

                if (corner1 > 0)
                    addChip("corner", corner1);

                if (corner2 > 0) {
                    addChip("corner2", corner2);
                }

            }
        } else {
            addChip(game.bet, game.getQuestion());
        }
    }

    function removeChips() {
        for (let i = 0; i < chips.length; i++) {
            let chip = chips[i];
            chip.remove();
        }

        chips = [];
    }

    function setActive(button, mode = false) {
        button.addClass("active");

        if (mode)
            activeButtonHolder.mode = button;
        else
            activeButtonHolder.type = button;
    }

    function setInactive(mode = false) {
        if (mode) {
            let button = activeButtonHolder.mode;
            button.removeClass("active");
            activeButtonHolder.mode = null;
        }
        else {
            let button = activeButtonHolder.type;
            button.removeClass("active");
            activeButtonHolder.type = null;
        }

    }

    function newGame(diff, lastGame) {
        if (lastGame instanceof GameMix)
            return new GameMix(diff);
        else
            return new Game(diff, lastGame.bet)
    }


    function buttonListener(event, mode = false) {
        let btn = $(event.target);
        let btnId = btn.attr("id");

        setInactive(mode);
        setActive(btn, mode);

        if (mode) {
            switch (btnId) {
                case "easy":
                    game = newGame(EASY, game);
                    break;
                case "med":
                    game = newGame(MED, game);
                    break;
                case "hard":
                    game = newGame(HARD, game);
                    break;
            }
        } else if (btnId == "mix") {
            game = new GameMix(game.difficulty);
        } else {
            game = new Game(game.difficulty, btnId);
        }

        removeChips();
        addChips(game)
    }

    // Add button listeners to all buttons
    for (let i = 0; i < gameRow.children().length; i++) {
        let btn = gameRow.children().eq(i);
        btn.on("click", e => buttonListener(e));
    }

    for (let i = 0; i < modeRow.children().length; i++) {
        let btn = modeRow.children().eq(i);
        btn.on("click", e => buttonListener(e, true));
    }

    form.on("submit", function (e) {
        e.preventDefault();

        let answer = $("input#answer").val()

        if (answer.length > 0) {
            // [0] get DOM object
            let s = resultsTable;
            let row = resultsTable[0].insertRow();

            if (game instanceof GameMix)
                row.insertCell().innerHTML = `${game.table}`;
            else
                row.insertCell().innerHTML = `${game.table} \u00D7 ${game.getQuestion()}`;
            row.insertCell().innerHTML = answer;

            if (game.verify(answer)) {
                game.next();

                row.insertCell().innerHTML = "Correct!";

                removeChips();
                addChips(game);
            } else {
                row.insertCell().innerHTML = "Wrong!";
            }

            $("input#answer").val("");
            $(".board-grid").focus();
        }
    });
});