const { Card } = require('./card.js');

//hand class
class Hand {
    constructor() {
        this.cards = [];
    }

    addCard(card) {
        this.cards.push(card);
    }

    getTotalValue() {
        let totalValue = 0;
        let numOfAces = 0;
        const faceCards = ['Jack', 'Queen', 'King'];
        for (let card of this.cards) {
            if (faceCards.includes(card.value)){
                totalValue += 10;
            }
            else if (card.value === "Ace"){
                numOfAces++;
                totalValue += 11;
            }
            else {
                totalValue += parseInt(card.value);
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