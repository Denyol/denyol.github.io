"use strict";
import { Game, Position, Bet, Bets, MODE } from './game.js';

$(function () {
    // Document constants
    const resultsTable = $("table");
    const suButton = $("#straight");
    const easyButton = $("#easy");

    const chipGrid = $("#overlay-grid");

    const form = $("form");

    const gameRow = $(".button-box").first();
    const modeRow = $(".button-box").eq(1);

    // Dialog setup
    const dialog = $("dialog")[0];

    if (typeof dialog.showModal == "function") // Modal not suported in all browsers
        $("#help-button").on("click", () => dialog.showModal());
    else
        $("#help-button").on("click", () => dialog.show());
    $("dialog div button").on("click", () => dialog.close());

    let activeButtonHolder = {
        type: null,
        mode: null,
    }

    // Set up
    setActive(suButton);
    setActive(easyButton, true);

    let game = new Game(Game.DIFF.EASY, MODE.STRAIGHT_UP);

    addChips(game);

    /**
     * Add a single chip to the DOM at position on board grid
     * @param {Position} type 
     * @param {Number} value 
     */
    function addChip(type, value) {
        if (value > 0) {
            let chip = document.createElement("div");
            let jChip = $(chip);

            jChip.addClass("chip");
            jChip.text(value);
            jChip.css("grid-column", `${type.col} / span 1`);
            jChip.css("grid-row", `${type.row} / span 1`);

            chipGrid.append(chip);
        }
    }

    /**
     * 
     * @param {Game} game 
     */
    function addChips(game) {
        let bet = game.current;

        let posVals = Array();

        posVals.push(bet.getStraightUp());
        posVals.push(bet.getSplit(0));
        posVals.push(bet.getSplit(1));
        posVals.push(bet.getSplit(2));
        posVals.push(bet.getSplit(3));
        posVals.push(bet.getCorner(0));
        posVals.push(bet.getCorner(1));
        posVals.push(bet.getCorner(2));
        posVals.push(bet.getCorner(3));
        posVals.push(bet.getStreet());
        posVals.push(bet.getSixLine(0));
        posVals.push(bet.getSixLine(1));

        posVals.forEach((posVal) => addChip(posVal.position, posVal.value));
    }

    function removeChips() {
        chipGrid.children().remove();
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

    function buttonListener(event, mode = false) {
        let btn = $(event.target);
        let btnId = btn.attr("id");

        setInactive(mode);
        setActive(btn, mode);

        if (mode) {
            switch (btnId) {
                case "easy":
                    game = new Game(Game.DIFF.EASY, game.mode);
                    break;
                case "med":
                    game = new Game(Game.DIFF.MED, game.mode);
                    break;
                case "hard":
                    game = new Game(Game.DIFF.HARD, game.mode);
                    break;
            }
        } else if (btnId == "mix") {
            game = new Game(game.diff, MODE.PICTURE_BET);
        } else {
            switch (btnId) {
                case "straight":
                    game = new Game(game.diff, MODE.STRAIGHT_UP);
                    break;
                case "split":
                    game = new Game(game.diff, MODE.SPLIT);
                    break;
                case "corner":
                    game = new Game(game.diff, MODE.CORNER);
                    break;
                case "street":
                    game = new Game(game.diff, MODE.STREET);
                    break;
            }
        }

        removeChips();
        addChips(game)
    }

    // Add button listeners to all buttons
    gameRow.children().on("click", e => buttonListener(e));

    for (let i = 0; i < modeRow.children().length; i++) {
        let btn = modeRow.children().eq(i);
        btn.on("click", e => buttonListener(e, true));
    }

    form.on("submit", e => {
        e.preventDefault();

        let answer = $("input#answer").val()

        if (answer.length > 0) {
            // [0] get DOM object
            let row = resultsTable[0].insertRow();

            row.insertCell().innerHTML = `${game.current.toString()}`;
            row.insertCell().innerHTML = answer;

            if (game.verify(answer)) {
                row.insertCell().innerHTML = "Correct!";

                removeChips();
                game.next();
                addChips(game);
            } else {
                row.insertCell().innerHTML = "Wrong!";
            }

            $("input#answer").val("");
        }
    });
});