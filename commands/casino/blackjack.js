const { SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Deck } = require('./blackjackClasses/deck.js');
const { Hand } = require('./blackjackClasses/hand.js');
const { Card } = require('./blackjackClasses/card.js');

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
        // playerHand.addCard(new Card('Hearts', 'Jack'));
        // playerHand.addCard(new Card('Spades', 'Jack'));

        



        const dealerHand = new Hand();
        dealerHand.addCard(deck.deal());
        dealerHand.addCard(deck.deal());

        await playGameLogic(playerHand, dealerHand, deck, interaction);
}
};

async function playGameLogic(hand, dealerHand, deck, interaction) {


    const response = await interaction.reply({ 
        embeds: [generateEmbed(interaction, hand, dealerHand, false)],
        components: [generateRow(false)] });

    const collectorFilter = i => i.user.id === interaction.user.id; 

    try {

        let double = false;
        let playerValue = hand.getTotalValue();

        while (playerValue < 21 && !double) {

            let confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });

            if (confirmation.customId === 'hit' || confirmation.customId === 'double') {
                if (confirmation.customId === 'double') {
                    hand.addCard(deck.deal());
                    await confirmation.update({
                        embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                        components: [generateRow(true)]
                    });
                    double = true;
                }
                else{
                    hand.addCard(deck.deal());
                    await confirmation.update({
                        embeds: [generateEmbed(interaction, hand, dealerHand, false)],
                        components: [generateRow(false)]
                    });
                   
                }

                playerValue = hand.getTotalValue();

                if(double){
                    break;
                }
               

            
            } else if (confirmation.customId === 'stay') {
                dealerValue = dealerHand.getTotalValue();
                while(dealerValue < 17) {
                    dealerHand.addCard(deck.deal());
                    dealerValue = dealerHand.getTotalValue();
                }
                if (dealerValue > 21) {
                    await confirmation.update({
                        embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                        components: [generateRow(true)] });
                    break;
                }
                else {
                    playerValue = hand.getTotalValue();
                    if(dealerValue > playerValue){
                        await confirmation.update({
                            embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                            components: [generateRow(true)] });
                        await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, dealerValue === 21 ? 'Dealer Blackjack! You Lose!' : 'You Lose!', '#ff0000')] });
                    }
                    else if(dealerValue === playerValue){
                        await confirmation.update({
                            embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                            components: [generateRow(true)] });
                        await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'Push!', '#FFFF00')] });
                    }
                    else{
                        await confirmation.update({
                            embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                            components: [generateRow(true)] });
                        await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'You Win!', '#00ff00')] });
                    }
                }
            
            }
            
        }

        if (playerValue > 21) {
            // Handle player bust
            await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'Bust! You Lose!', '#ff0000')] });
            await response.edit({ components: [generateRow(true)] });
        } else if (playerValue === 21) {
            dealerValue = dealerHand.getTotalValue();
            await response.edit({ components: [generateRow(true)] });
            while (dealerValue < 17) {
                dealerHand.addCard(deck.deal());
                dealerValue = dealerHand.getTotalValue();
            }
            await response.edit({
                embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                components: [generateRow(true)]
            })
            if(dealerValue === 21) {
                await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'Push!', '#FFFF00')] });
            }
            else
                await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'Blackjack! You Win!', '#00ff00')] });
        } else {
            dealerValue = dealerHand.getTotalValue();
                while(dealerValue < 17) {
                    dealerHand.addCard(deck.deal());
                    dealerValue = dealerHand.getTotalValue();
                }
                if (dealerValue > 21) {
                    await response.edit({
                        embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                        components: [generateRow(true)] });
                    await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'Dealer Bust! You Win!', '#00ff00')] });
                }
                else {
                    playerValue = hand.getTotalValue();
                    if(dealerValue > playerValue){
                        await response.edit({
                            embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                            components: [generateRow(true)] });
                        await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, dealerValue === 21 ? 'Dealer Blackjack! You Lose!' : 'You Lose!', '#ff0000')] });
                    }
                    else if(dealerValue === playerValue){
                        await response.edit({
                            embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                            components: [generateRow(true)] });
                        await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'Push!', '#FFFF00')] });
                    }
                    else{
                        await response.edit({
                            embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                            components: [generateRow(true)] });
                        await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'You Win!', '#00ff00')] });
                    }
                }
        }
    } catch (e) {
        await response.edit({ content: 'Decision not received within 1 minute, cancelling', components: [] });
    }

        // Return the result based on game progress
        // 'finished' if hand is finished, 'split' if split occurred
        // return result;
}


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


function generateEmbed(interaction, player, dealer, showDealerHand) {
    const playerCards = player.cards.map(cardToString).join(" ");
    const dealerCards = dealer.cards.map((card, index) => showDealerHand || index === 0 ? cardToString(card) : '🂠').join(" ");
    const dealerValue = showDealerHand ? dealer.getTotalValue() : '??';
    
    const playerValue = player.getTotalValue();
    const embed = new EmbedBuilder()
        .setTitle(`Blackjack`)
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
        .setColor('#0099ff')
        .addFields(
            { name: "Player's Hand", value: playerCards, inline: true},
            { name: "Value", value: `${playerValue}`, inline: true},
            { name: "\u200B", value: "\u200B", inline: false },
            { name: "Dealer's Hand", value: dealerCards, inline: true},
            { name: "Value", value: `${dealerValue}`, inline: true},
        )

    return embed
}

function generateMessageEmbed(interaction, title, color) {
    return new EmbedBuilder()
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
        .setTitle(title)
        .setColor(color)
}

function generateRow(disableButton = false) {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('hit')
                .setLabel('Hit')
                .setStyle(ButtonStyle.Success)
                .setDisabled(disableButton),
            new ButtonBuilder()
                .setCustomId('stay')
                .setLabel('Stay')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disableButton),
            new ButtonBuilder()
                .setCustomId('double')
                .setLabel('Double Down')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(disableButton)
        );
    return row;
}
