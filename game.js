"strict mode";

const MODE = {
    PICTURE_BET: 100,
    STRAIGHT_UP: 35,
    SPLIT: 17,
    CORNER: 8,
    STREET: 11,
    SIX: 5
};

function BetStructure(straightUps = 0, splits = 0, corners = 0, streets = 0, sixs = 0) {
    this.straightUps = straightUps;
    this.splits = splits;
    this.corners = corners;
    this.streets = streets;
    this.sixs = sixs;
}

const PictureBet = {
    p21: new BetStructure(0, 0, 0, 1, 2),
    p25: new BetStructure(0, 1, 1),
    p33: new BetStructure(0, 1, 2),
    p42: new BetStructure(0, 2, 1),
    p43: new BetStructure(1, 0, 1),
    p51: new BetStructure(1, 0, 2),
    p52: new BetStructure(1, 1),
    p60: new BetStructure(1, 1, 1),
    p67: new BetStructure(1, 0, 4),
    p86: new BetStructure(1, 3),
    p100: new BetStructure(0, 4, 4),
    p101: new BetStructure(1, 2, 4),
    p103: new BetStructure(1, 4),
    p135: new BetStructure(1, 4, 4),
};

function randomInt(max) {
    return Math.round(Math.random() * max);
}

/**
 * Game represents an instance of a game with a single difficulty and question set
 */
class Game {
    static DIFF = {
        EASY: 10,
        MED: 15,
        HARD: 20
    };

    current;

    #singleModeState = {
        operands: [],
        index: 0
    }

    #singleMode = true;

    constructor(diff, mode) {
        this.diff = diff;
        this.mode = mode;

        // Set mix mode state
        if (mode == MODE.PICTURE_BET) {
            this.#singleMode = false;
        } else {
            // Generate unique random questions
            for (let i = 0; i < this.diff; i++) {
                let op = this.#genOperand();

                while (this.#singleModeState.operands.includes(op)) {
                    op = this.#genOperand()
                }

                this.#singleModeState.operands.push(op);
            }
        }

        this.next();
    }

    /**
     * @returns Random number (0, difficulty]
     */
    #genOperand() {
        return Math.ceil(Math.random() * this.diff);
    }

    get singleMode() {
        return this.#singleMode;
    }

    /**
     * Steps to next question
     * @returns {Bet} bet
     */
    next() {
        if (this.#singleMode) {
            this.#nextSingle();
        } else {
            let pictureBets = Object.keys(PictureBet);
            // Get random picture bet
            let index = randomInt(pictureBets.length - 1);
            let pictureBet = PictureBet[pictureBets[index]];
            let number = this.#genOperand();

            let matrix = new Array(12).fill(0);

            this.#addBetsToMatrix(matrix, pictureBet, number);

            if (this.diff >= Game.DIFF.MED) {
                pictureBets.splice(index, 1); // Get two unique bets
                pictureBet = PictureBet[pictureBets[randomInt(pictureBets.length - 1)]];
                number = this.#genOperand();

                this.#addBetsToMatrix(matrix, pictureBet, number);
            }

            this.current = new Bet(matrix);
        }
    }

    #addBetsToMatrix(matrix, pictureBet, multiplier) {
        if (pictureBet.straightUps > 0)
            matrix[Bet.STRAIGHT_UP] += multiplier;

        if (pictureBet.streets > 0)
            matrix[Bet.STREET] += multiplier;

        for (let i = 0; i < pictureBet.splits; i++) {
            matrix[Bet.SPLIT[i]] += multiplier;
        }

        for (let i = 0; i < pictureBet.corners; i++) {
            matrix[Bet.CORNER[i]] += multiplier;
        }

        for (let i = 0; i < pictureBet.sixs; i++) {
            matrix[Bet.SIX[i]] += multiplier;
        }

    }

    #nextSingle() {
        this.#singleModeState.index++;

        // Wrap around
        if (this.#singleModeState.index >= this.#singleModeState.operands.length)
            this.#singleModeState.index = 0;

        let matrix = [];

        if (this.mode == MODE.STRAIGHT_UP)
            matrix[Bet.STRAIGHT_UP] = this.#singleModeState.operands[this.#singleModeState.index];
        else if (this.mode == MODE.CORNER)
            matrix[Bet.CORNER[0]] = this.#singleModeState.operands[this.#singleModeState.index];
        else if (this.mode == MODE.SPLIT)
            matrix[Bet.SPLIT[0]] = this.#singleModeState.operands[this.#singleModeState.index];
        else if (this.mode == MODE.STREET)
            matrix[Bet.STREET] = this.#singleModeState.operands[this.#singleModeState.index];
        else if (this.mode == MODE.SIX)
            matrix[Bet.SIX[0]] = this.#singleModeState.operands[this.#singleModeState.index];

        this.current = new Bet(matrix)
    }

    verify(answer) {
        return answer == this.current.getValue();
    }

}

function Position(row, col) {
    this.row = row;
    this.col = col;
}

const Bets = {
    STRAIGHTUP: new Position(2, 4),
    STREET: new Position(2, 1),
    CORNERS: [
        new Position(1, 3), new Position(1, 5), new Position(3, 3), new Position(3, 5)
    ],
    SPLITS: [
        new Position(1, 4), new Position(2, 3), new Position(2, 5), new Position(3, 4)
    ],
    SIXS: [new Position(1, 1), new Position(3, 1)]
}

class Bet {
    // Index of bet in object/matrix
    static SIX = [0, 8];
    static CORNER = [1, 3, 9, 11];
    static SPLIT = [2, 5, 7, 10];
    static STREET = 4;
    static STRAIGHT_UP = 6;

    /**
     * @param {Number[]} matrix An integer array representing a bet placed in any of 12 positions.
     * Positions are arranged left to right top to bottom in each winning position with respect to
     * the center number.
     */
    constructor(matrix) {
        matrix.forEach((value, index) => {
            this[index] = value;
        })

        // Fill index with 0
        for (let i = 0; i < 12; i++) {
            if (this[i] == undefined)
                this[i] = 0;
        }
    }

    /**
     * @returns {Number} Total number of chips if won
     */
    getValue() {
        let total = 0;

        total += this.splits * MODE.SPLIT;
        total += this.corners * MODE.CORNER;
        total += this.streets * MODE.STREET;
        total += this.straightUps * MODE.STRAIGHT_UP;
        total += this.sixs * MODE.SIX;

        return total;
    }

    /**
     * @param {Number} numberOfBets
     * @param {Number[]} bet bet type from Bet
     * @returns {Number} total
     */
    #getTotal(numberOfBets, bet) {
        let total = 0;
        for (let i = 0; i < numberOfBets; i++) {
            total += this[bet[i]];
        }

        return total;

    }

    get splits() {
        return this.#getTotal(4, Bet.SPLIT);
    }

    get corners() {
        return this.#getTotal(4, Bet.CORNER);
    }

    get streets() {
        return this[Bet.STREET];
    }

    get straightUps() {
        return this[Bet.STRAIGHT_UP];
    }

    get sixs() {
        return this.#getTotal(2, Bet.SIX);
    }

    #toPosVal(pos, val) {
        return { position: pos, value: val };
    }

    /**
     * @param {Number} index 0-3 corner index
     * @returns {Position}
     */
    getCorner(index) {
        return this.#toPosVal(Bets.CORNERS[index], this[Bet.CORNER[index]]);
    }

    /**
     * @param {Number} index 0-3 split index
     * @returns {Position}
     */
    getSplit(index) {
        return this.#toPosVal(Bets.SPLITS[index], this[Bet.SPLIT[index]]);
    }

    /**
     * @param {Number} index 0-1 six line index
     */
    getSixLine(index) {
        return this.#toPosVal(Bets.SIXS[index], this[Bet.SIX[index]]);
    }

    /**
     * @returns {Position}
     */
    getStraightUp() {
        return this.#toPosVal(Bets.STRAIGHTUP, this[Bet.STRAIGHT_UP]);
    }

    /**
     * @returns {Position}
     */
    getStreet() {
        return this.#toPosVal(Bets.STREET, this[Bet.STREET]);
    }

    toString() {
        let straightUps = this.straightUps;
        let splits = this.splits;
        let corners = this.corners;
        let sixs = this.sixs;
        let streets = this.streets;

        let result = "";

        if (straightUps > 0)
            result += `35: ${straightUps} `
        if (splits > 0)
            result += `17: ${splits} `
        if (streets > 0)
            result += `11: ${streets} `
        if (corners > 0)
            result += `8: ${corners} `
        if (sixs > 0)
            result += `5: ${sixs}`

        return result;
    }
}

export { Game, Position, Bets, Bet, MODE };