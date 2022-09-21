export class Game {
    operands = []
    #state = 0;

    constructor(diff = 10, bet = "straight") {
        this.difficulty = diff;
        this.bet = bet;

        for (let i = 0; i < this.difficulty; i++) {
            let op = this.genOperand();

            while (this.operands.includes(op)) {
                op = this.genOperand()
            }

            this.operands.push(op);
        }
    }

    genOperand() {
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

export class GameMix {

    #bet = {
        straight: 0,
        split: 0,
        corner: 0,
        street: 0,
    }

    constructor(diff = 5) {
        this.difficulty = diff;

        this.next();
    }

    get table() {
        let result = "";

        if (this.#bet.straight != 0)
            result += `35: ${this.#bet.straight} `

        if (this.#bet.split != 0)
            result += `17: ${this.#bet.split} `

        if (this.#bet.corner != 0)
            result += `8: ${this.#bet.corner} `

        if (this.#bet.street != 0)
            result += `11: ${this.#bet.street}`

        return result;
    }

    genOperand() {
        return Math.ceil(Math.random() * this.difficulty);
    }

    verify(answer) {
        let total = this.#bet.straight * 35 + this.#bet.corner * 8
            + this.#bet.split * 17 + this.#bet.street * 11;

        return answer == total;
    }

    #resetBets() {
        this.#bet = {
            straight: 0,
            split: 0,
            corner: 0,
            street: 0,
        }
    }

    next() {
        this.#resetBets();

        let bets = Math.round(Math.random() * 4);

        if (this.difficulty == 10)
            bets = 2;

        let betChance = [Math.random(), Math.random(), Math.random(), Math.random()];

        for (let i = 0; i < bets; i++) {
            let maxIndex = betChance.indexOf(Math.max(...betChance));

            switch (maxIndex) {
                case 0:
                    this.#bet.straight = this.genOperand();
                    break;
                case 1:
                    this.#bet.split = this.genOperand();
                    break;
                case 2:
                    this.#bet.corner = this.genOperand();
                    break;
                case 3:
                    this.#bet.street = this.genOperand();
                    break;
            }

            betChance[maxIndex] = 0;
        }
        console.log("Bet: " + JSON.stringify(this.#bet));
    }

    get straightUps() {
        return this.#bet.straight;
    }

    get splits() {
        return this.#bet.split;
    }

    get corners() {
        return this.#bet.corner;
    }

    get streets() {
        return this.#bet.street;
    }
}