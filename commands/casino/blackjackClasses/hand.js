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
        const faceCards = ['Jack', 'Queen', 'King'];
        for (let card of this.cards) {
            if (faceCards.includes(card.value)){
                totalValue += 10;
                console.log("face card:" , `${totalValue}`);
            }
            else if (card.value === "Ace"){
                numOfAces++;
                totalValue += 11;
                console.log("ace:" , `${totalValue}`);
            }
            else {
                totalValue += parseInt(card.value);
                console.log("number:" , `${totalValue}`);
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