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
            .setTitle('You Lose!')
            .setColor('#ff0000')

        const winEmbed = new EmbedBuilder()
            .setTitle('Blackjack! You Win!')
            .setColor('#0099ff')

        const pushEmbed = new EmbedBuilder()
            .setTitle('Push!')
            .setColor('#FFFF00')
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
            embeds: [generateEmbed(interaction, playerHand, dealerHand, false)],
            components: [generateRow(false)]});

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
                            embeds: [generateEmbed(interaction, playerHand, dealerHand, false)],
                            components: [generateRow(false)] });
                    } catch (e) {
                        console.log(e);
                    }
                }
                else if (confirmation.customId === 'stay') {
                    dealerValue = dealerHand.getTotalValue();
                    while(dealerValue < 17) {
                        dealerHand.addCard(deck.deal());
                        dealerValue = dealerHand.getTotalValue();
                    }
                    if (dealerValue > 21) {
                        await confirmation.update({
                            embeds: [generateEmbed(interaction, playerHand, dealerHand, true)],
                            components: [generateRow(true)] });
                        await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'Dealer Bust! You Win!', '#0099ff')] });
                        break;
                    }
                    else {
                        playerValue = playerHand.getTotalValue();
                        if(dealerValue > playerValue){
                            await confirmation.update({
                                embeds: [generateEmbed(interaction, playerHand, dealerHand, true)],
                                components: [generateRow(true)] });
                            await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'You Lose!', '#ff0000')] });
                        }
                        else if(dealerValue === playerValue){
                            await confirmation.update({
                                embeds: [generateEmbed(interaction, playerHand, dealerHand, true)],
                                components: [generateRow(true)] });
                            await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'Push!', '#FFFF00')] });
                        }
                        else{
                            await confirmation.update({
                                embeds: [generateEmbed(interaction, playerHand, dealerHand, true)],
                                components: [generateRow(true)] });
                            await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'You Win!', '#0099ff')] });
                        }
                    }
                }
            }

            if(playerValue > 21) {
                await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'Bust! You Lose!', '#ff0000')] });
                await response.edit({ components: [generateRow(true)] });
            }

            else if (playerValue === 21) {
                dealerValue = dealerHand.getTotalValue();
                await response.edit({ components: [generateRow(true)] });
                await interaction.channel.send({
                    embeds: [generateEmbed(interaction, playerHand, dealerHand, true)],
                    components: [generateRow(true)]
                })
                if(dealerValue === 21) {
                    await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'Push!', '#FFFF00')] });
                }
                else
                    await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'Blackjack! You Win!', '#0099ff')] });
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


function generateEmbed(interaction, player, dealer, showDealerHand) {
    const playerCards = player.cards.map(cardToString).join(" ");
    const dealerCards = dealer.cards.map((card, index) => showDealerHand || index === 0 ? cardToString(card) : '🂠').join(" ");
    const dealerValue = showDealerHand ? dealer.getTotalValue() : '??';
    
    const playerValue = player.getTotalValue();
    const embed = new EmbedBuilder()
        .setTitle('Blackjack')
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
                .setDisabled(disableButton)
        );
    return row;
}