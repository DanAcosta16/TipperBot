const { SlashCommandBuilder } = require('discord.js');
const { Deck } = require('./blackjackClasses/deck.js');
const { Hand } = require('./blackjackClasses/hand.js');

module.exports = {
	// cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('blackjack')
		.setDescription('Play a game of Blackjack.'),
	async execute(interaction) {
		const deck = new Deck();
        deck.shuffle();
        console.log(deck.deal());

        const playerHand = new Hand();

        playerHand.addCard(deck.deal());
        playerHand.addCard(deck.deal());

        const dealerHand = new Hand();
        dealerHand.addCard(deck.deal());
        dealerHand.addCard(deck.deal());

        const firstCard = playerHand.cards[0]
        console.log(firstCard);
	}
};