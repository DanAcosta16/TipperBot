const { SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Deck } = require('./blackjackClasses/deck.js');
const { Hand } = require('./blackjackClasses/hand.js');

module.exports = {
	// cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('blackjack')
		.setDescription('Play a game of Blackjack.'),
	async execute(interaction) {
        const cardImagesBaseURL = 'https://deckofcardsapi.com/static/img/';
		const deck = new Deck();
        deck.shuffle();
        console.log(deck.deal());

        const playerHand = new Hand();
        playerHand.addCard(deck.deal());
        playerHand.addCard(deck.deal());

        const dealerHand = new Hand();
        dealerHand.addCard(deck.deal());
        dealerHand.addCard(deck.deal());

        // let playerCards = playerHand.cards.map(cardToString).join(" ");
        // let dealerCards = dealerHand.cards.map(cardToString).join(" ");

        // let playerValue = playerHand.getTotalValue();
        // let dealerValue = dealerHand.getTotalValue();


        
        

        // let embed = new EmbedBuilder()
        //     .setTitle('Blackjack')
        //     .setColor('#0099ff')
        //     .addFields(
        //         { name: "Player's Hand", value: playerCards, inline: true},
        //         { name: "Value", value: `${playerValue}`, inline: true},
        //         { name: "\u200B", value: "\u200B", inline: false },
        //         { name: "Dealers's Hand", value: dealerCards, inline: true},
        //         { name: "Value", value: `${dealerValue}`, inline: true},
        //     )

        const lossEmbed = new EmbedBuilder()
            .setTitle('Bust! You Lose!')
            .setColor('#ff0000')

        const winEmbed = new EmbedBuilder()
            .setTitle('Blackjack! You Win!')
            .setColor('#0099ff')
        // let message = await interaction.channel.send({ embeds: [embed] });

        // const hit = new ButtonBuilder()
        //     .setCustomId('hit')
        //     .setLabel('Hit')
        //     .setStyle(ButtonStyle.Success);

        // const stay = new ButtonBuilder()
        //     .setCustomId('stay')
        //     .setLabel('Stay')
        //     .setStyle(ButtonStyle.Primary);
        
        // const row = new ActionRowBuilder()
        //     .addComponents(hit, stay);

        const response = await interaction.reply({ 
            embeds: [generateEmbed(playerHand, dealerHand)],
            components: [generateRow()]});

        const collectorFilter = i => i.user.id === interaction.user.id; 

        try {
            let playerValue = playerHand.getTotalValue();
            while(playerValue < 21) {
                let confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
                if (confirmation.customId === 'hit') {
                    playerHand.addCard(deck.deal());
                    playerValue = playerHand.getTotalValue();
                    try {
                        await confirmation.update({ 
                            embeds: [generateEmbed(playerHand, dealerHand)],
                            components: [generateRow()] });
                    } catch (e) {
                        console.log(e);
                    }
                }
                else{
                    break;
                }
            }

            if(playerValue > 21) {
                await interaction.channel.send({ embeds: [lossEmbed] });
            }

            else if (playerValue === 21) {
                await interaction.channel.send({ embeds: [winEmbed] });
            }

            // else if(playerValue > 21) {
            //     interaction.channel.send({ embeds: [lossEmbed] });
            //     return;
            // }
        } catch (e) {
            await response.edit({ content: 'Decision not received within 1 minute, cancelling', components: [] });
        }
	}
};

function cardToString(card) {
    const suits = {
        'Hearts': '♥️',
        'Diamonds': '♦️',
        'Clubs': '♣️',
        'Spades': '♠️'
      };
    const value = {
        'Jack': 'J',
        'Queen': 'Q',
        'King': 'K',
        'Ace': 'A'
    };
    let cardSymbol = '';
    if (card.suit in suits) {
        cardSymbol = suits[card.suit];
    } else {
        cardSymbol = card.suit;
    }
    let cardValue = '';
    if (card.value in value) {
        cardValue = value[card.value];
    } else {
        cardValue = card.value;
    }
    return `${cardValue}${cardSymbol}`;
}

function generateEmbed(player, dealer) {
    const playerCards = player.cards.map(cardToString).join(" ");
    const dealerCards = dealer.cards.map(cardToString).join(" ");
    const playerValue = player.getTotalValue();
    const dealerValue = dealer.getTotalValue();
    const embed = new EmbedBuilder()
        .setTitle('Blackjack')
        .setColor('#0099ff')
        .addFields(
            { name: "Player's Hand", value: playerCards, inline: true},
            { name: "Value", value: `${playerValue}`, inline: true},
            { name: "\u200B", value: "\u200B", inline: false },
            { name: "Dealers's Hand", value: dealerCards, inline: true},
            { name: "Value", value: `${dealerValue}`, inline: true},
        )

    return embed
}

function generateRow() {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('hit')
                .setLabel('Hit')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('stay')
                .setLabel('Stay')
                .setStyle(ButtonStyle.Primary)
        );
    return row;
}