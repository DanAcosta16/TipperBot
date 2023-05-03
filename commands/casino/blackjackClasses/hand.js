const { Card } = require('./card.js');

//hand class
class Hand {
    constructor() {
        this.cards = [];
        console.log("Hand created");
    }

    addCard(card) {
        this.cards.push(card);
        console.log("Card added");
    }

    getTotalValue() {
        let totalValue = 0;
        let numOfAces = 0;
        for (let card of this.cards) {
            totalValue += card.value;
            if (card.rank === "Ace") {
                numOfAces++;
            }
        }
        while (numOfAces > 0 && totalValue > 21) {
            totalValue -= 10;
            numOfAces--;
        }
        return totalValue;
    }
}

module.exports = { Hand };