const { SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Deck } = require('./blackjackClasses/deck.js');
const { Hand } = require('./blackjackClasses/hand.js');
const { Card } = require('./blackjackClasses/card.js');
const { Users } = require('../../models/dbObjects'); 

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('blackjack')
		.setDescription('Play a game of Blackjack.')
        .addIntegerOption((option) => 
            option
            .setName('amount')
            .setDescription('Enter the bet amount')
            .setRequired(true)
            .setMinValue(50)
        ),
	async execute(interaction) {
        let double = false;
        await interaction.deferReply();
        const user = await Users.findOne({ where: { user_id: interaction.user.id } });
        const bet = interaction.options.getInteger('amount');
        if (user){
            if (user.balance < bet) {
                const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        .setTitle(`You don't have enough money.`)
                        .setDescription(`Balance: $${user.balance}`);
    
                await interaction.editReply({ embeds: [embed] });
                return;
            }
            
            if (user.balance > (bet * 2)) {
                double = true;
            }
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
    
            let result = await playGameLogic(playerHand, dealerHand, deck, interaction, double);
            result[1] = true;
            //if result is win add to balance and send message
            if (result[0] === 'win') {
                let winnings;
                if (result[1] === true) {
                    winnings = bet * 2;
                    await user.increment('balance', { by: winnings});
                }
                else {
                    winnings = bet;
                    await user.increment('balance', { by: winnings});
                }
                
                await user.reload();
                const embed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        .setTitle(`+$${winnings}`)
                        .setDescription(`Current Balance: $${user.balance}`);
    
                await interaction.channel.send({ embeds: [embed] });
            } else if (result[0] === 'loss') {
                let losses;
                if (result[1] === true) {
                    losses = bet * 2;
                    await user.decrement('balance', { by: bet * 2 });
                }
                else {
                    losses = bet;
                    await user.decrement('balance', { by: bet});
                }
                await user.reload();
                const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        .setTitle(`-$${losses}`)
                        .setDescription(`Current Balance: $${user.balance}`);
                await interaction.channel.send({ embeds: [embed] });
            } else if (result[0] === 'push') {
                const embed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        .setTitle(`Current Balance`)
                        .setDescription(`$${user.balance}`);
                await interaction.channel.send({ embeds: [embed] });
            }
        } else {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('User Not Found')
                .setDescription(`User ${interaction.user.id} is not registered.`);

            await interaction.editReply({ embeds: [embed] });
        }
        
}
};

async function playGameLogic(hand, dealerHand, deck, interaction, double) {

    let gameOutcome = null;
    let response = await interaction.editReply({ 
        embeds: [generateEmbed(interaction, hand, dealerHand, false)],
        components: [generateRow(false, !double)] });

    const collectorFilter = i => i.user.id === interaction.user.id; 

    try {

        let doubledown = false;
        let playerValue = hand.getTotalValue();


        while (playerValue < 21 && !doubledown) {

            

            let confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });

            if (confirmation.customId === 'hit' || confirmation.customId === 'double') {
                
                if (confirmation.customId === 'double') {
                    hand.addCard(deck.deal());
                    await confirmation.update({
                        embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                        components: [generateRow(true, true)]
                    });
                    doubledown = true;
                }
                else{
                    hand.addCard(deck.deal());
                    await confirmation.update({
                        embeds: [generateEmbed(interaction, hand, dealerHand, false)],
                        components: [generateRow(false, !double)]
                    });
                   
                }

                playerValue = hand.getTotalValue();
               

            
            } else if (confirmation.customId === 'stay') {
                dealerValue = dealerHand.getTotalValue();
                while(dealerValue < 17) {
                    console.log('here');
                    dealerHand.addCard(deck.deal());
                    dealerValue = dealerHand.getTotalValue();
                }
                if (dealerValue > 21) {
                    await confirmation.update({
                        embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                        components: [generateRow(true, true)] });
                    break;
                }
                else {
                    playerValue = hand.getTotalValue();
                    if(dealerValue > playerValue){
                        await confirmation.update({
                            embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                            components: [generateRow(true, true)] });
                        await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, dealerValue === 21 ? 'Dealer Blackjack! You Lose!' : 'You Lose!', '#ff0000')] });
                        gameOutcome = 'loss';
                        return [gameOutcome, doubledown];
                        


                    }
                    else if(dealerValue === playerValue){
                        await confirmation.update({
                            embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                            components: [generateRow(true, true)] });
                        await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'Push!', '#FFFF00')] });
                        gameOutcome = 'push';
                        return [gameOutcome, doubledown];
                    }
                    else{
                        await confirmation.update({
                            embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                            components: [generateRow(true, true)] });
                        await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'You Win!', '#00ff00')] });
                        gameOutcome = 'win';
                        return [gameOutcome, doubledown];
                        
                    }
                }
            
            }
            
        }

        if (playerValue > 21) {
            // Handle player bust
            await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'Bust! You Lose!', '#ff0000')] });
            await response.edit({ components: [generateRow(true, true)] });
            gameOutcome = 'loss';
            
        } else if (playerValue === 21) {
            dealerValue = dealerHand.getTotalValue();
            await response.edit({ components: [generateRow(true, true)] });
            while (dealerValue < 17) {
                dealerHand.addCard(deck.deal());
                dealerValue = dealerHand.getTotalValue();
            }
            await response.edit({
                embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                components: [generateRow(true, true)] });
            
            if(dealerValue === 21) {
                await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'Push!', '#FFFF00')] });
                gameOutcome = 'push';
                
            }
            else{
                await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'Blackjack! You Win!', '#00ff00')] });
                gameOutcome = 'win';
            }
                
        
        } else {
            dealerValue = dealerHand.getTotalValue();
                while(dealerValue < 17) {
                    dealerHand.addCard(deck.deal());
                    dealerValue = dealerHand.getTotalValue();
                }
                if (dealerValue > 21) {
                    await response.edit({
                        embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                        components: [generateRow(true, true)] });
                    await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'Dealer Bust! You Win!', '#00ff00')] });
                    gameOutcome = 'win';
                    
                }
                else {
                    playerValue = hand.getTotalValue();
                    if(dealerValue > playerValue){
                        await response.edit({
                            embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                            components: [generateRow(true, true)] });
                        await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, dealerValue === 21 ? 'Dealer Blackjack! You Lose!' : 'You Lose!', '#ff0000')] });
                        gameOutcome = 'loss';
                    }
                    else if(dealerValue === playerValue){
                        await response.edit({
                            embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                            components: [generateRow(true, true)] });
                        await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'Push!', '#FFFF00')] });
                        gameOutcome = 'push';
                        
                    }
                    else{
                        await response.edit({
                            embeds: [generateEmbed(interaction, hand, dealerHand, true)],
                            components: [generateRow(true, true)] });
                        await interaction.channel.send({ embeds: [generateMessageEmbed(interaction, 'You Win!', '#00ff00')] });
                        gameOutcome = 'win';
                        
                    }
                }
        }
        return [gameOutcome, doubledown];
    
    } catch (e) {
        await response.edit({ content: 'Decision not received within 1 minute, cancelling', components: [] });
    }

    
}

        // Return the result based on game progress
        // 'finished' if hand is finished, 'split' if split occurred
        // return result;



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

function generateRow(disableButton = false, enableDouble = false) {
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
                .setDisabled(enableDouble)
        );
    return row;
}