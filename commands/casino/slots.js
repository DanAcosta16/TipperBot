const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Users } = require('../../models/dbObjects');
const { updateFinancialStatus } = require('../../helperfunctions/updateFinancialStatus');
module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Play slots game')
        .addIntegerOption((option) =>
            option
            .setName('amount')
            .setDescription('Enter the bet amount')
            .setRequired(true)
            .setMinValue(50)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const user = await Users.findOne({ where: { user_id: interaction.user.id } });
        const bet = interaction.options.getInteger('amount');

        try {

            if(user){
                if (user.isInJail) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        .setTitle(`You can't play Slots while you're in jail.`)
                    await interaction.editReply({ embeds: [embed] });
                    return;
                }
                if (user.balance < bet) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        .setTitle(`You don't have enough tipperbucks.`)
                        .setDescription(`Balance: $${user.balance}`);
                    await interaction.editReply({ embeds: [embed] });
                    return;
                }

                let result = await playSlots(interaction);

                const twoPairEmojis = TwoPairs(result);
                const twoEmojisInARow = TwoInARow(result);
                const threeEmojisInARow = ThreeInARow(result);
                const fourEmojisInARow = FourInARow(result);
                const fiveEmojisInARow = FiveInARow(result);

                const payoutMatrix = {
                    '<:reddit:1101329646655651921>': {
                        'twoinrow' : 0.25,
                        'threeinrow' : 0.5,
                        'fourinrow' : 1.5,
                        'fiveinrow' : 8,
                    },
                    '<:amogus:847263523537289236>': {
                        'twoinrow' : 0.25,
                        'threeinrow' : 0.5,
                        'fourinrow' : 1.5,
                        'fiveinrow' : 8,
                    },
                    '<:gug:1051031219011330098>': {
                        'twoinrow' : 0.5,
                        'threeinrow' : 1,
                        'fourinrow' : 2,
                        'fiveinrow' : 8.5,
                    },
                    '<:cheers:1050202826019700766>': {
                        'twoinrow' : 1,
                        'threeinrow' : 2,
                        'fourinrow' : 5,
                        'fiveinrow' : 13,
                    },
                    '<:handsomesquidward:1066045471161856200>': {
                        'twoinrow' : 2,
                        'threeinrow' : 5,
                        'fourinrow' : 10,
                        'fiveinrow' : 20
                    },
                    '<:thanospog:782114477201555456>': {
                        'twoinrow' : 5,
                        'threeinrow' : 10,
                        'fourinrow' : 20,
                        'fiveinrow' : 40,
                    },
                    '<a:raresheep:1145255369606709329>': {
                        'twoinrow' : 10,
                        'threeinrow' : 20,
                        'fourinrow' : 40,
                        'fiveinrow' : 100,
                    }
                
                }
                

                
                const embed = new EmbedBuilder()
                if(fiveEmojisInARow) {
                    const scenario = 'fiveinrow';
                    const multiplier = payoutMatrix[fiveEmojisInARow][scenario];
                    const winnings = Math.floor(bet * multiplier) - bet;
                    await user.increment('balance', { by: winnings });
                    await user.reload();
                    
                    

                    embed.setTitle(`Jackpot! +$${winnings}`);
                    embed.setDescription(`Current Balance: $${user.balance}`);
                    embed.setColor('#00FF00');
                    embed.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    
                    await interaction.followUp({ embeds: [embed] });
                    await updateFinancialStatus(interaction);

                }
                else if (fourEmojisInARow) {
                    const scenario = 'fourinrow';
                    const multiplier = payoutMatrix[fourEmojisInARow][scenario];
                    const winnings = Math.floor(bet * multiplier) - bet;
                    await user.increment('balance', { by: winnings });
                    await user.reload();
                    
                    embed.setTitle(`You win! Four in a row! +$${winnings}`);
                    embed.setDescription(`Current Balance: $${user.balance}`);
                    embed.setColor('#00FF00');
                    embed.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    await interaction.followUp({ embeds: [embed] });
                    await updateFinancialStatus(interaction);
                    
                }
                else if (threeEmojisInARow) {
                    if (twoEmojisInARow) {
                        const threeInRowScenario = 'threeinrow';
                        const twoInRowScenario = 'twoinrow';
                        const multiplier = payoutMatrix[threeEmojisInARow][threeInRowScenario] + payoutMatrix[twoEmojisInARow][twoInRowScenario];
                        const winnings = Math.floor(bet * multiplier) - bet;
                        await user.increment('balance', { by: winnings });
                        await user.reload();
                        
                        if(winnings >= 0) {
                            embed.setTitle(`You win! Full House! +$${winnings}`);
                            embed.setColor('#00FF00');
                        }
                        else {
                            embed.setTitle(`You lose! Full House! -$${Math.abs(winnings)}`);
                            embed.setColor('#FF0000');
                        }
                        embed.setDescription(`Current Balance: $${user.balance}`);
                        
                        embed.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        await interaction.followUp({ embeds: [embed] });
                        await updateFinancialStatus(interaction);
                    }
                    else {
                        const scenario = 'threeinrow';
                        const multiplier = payoutMatrix[threeEmojisInARow][scenario];
                        const winnings = Math.floor(bet * multiplier) - bet;
                        await user.increment('balance', { by: winnings });
                        await user.reload();
                        

                        if(winnings >= 0) {
                            embed.setTitle(`You win! Three in a row! +$${winnings}`);
                            embed.setColor('#00FF00');
                        }
                        else {
                            embed.setTitle(`You lose! Three in a row! -$${Math.abs(winnings)}`);
                            embed.setColor('#FF0000');
                        }
                        embed.setDescription(`Current Balance: $${user.balance}`);
                        
                        embed.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        await interaction.followUp({ embeds: [embed] });
                        await updateFinancialStatus(interaction);
                    }
                }
                else if (twoEmojisInARow) {
                    if (twoPairEmojis) {
                        const firstPairScenario = 'twoinrow';
                        const secondPairScenario = 'twoinrow';
                        const multiplier = payoutMatrix[twoPairEmojis[0]][firstPairScenario] + payoutMatrix[twoPairEmojis[1]][secondPairScenario];
                        const winnings = Math.floor(bet * multiplier) - bet;
                        await user.increment('balance', { by: winnings });
                        await user.reload();
                        

                        if(winnings >= 0) {
                            embed.setTitle(`You win! Two pair! +$${winnings}`);
                            embed.setColor('#00FF00');
                        }
                        else {
                            embed.setTitle(`You lose! Two pair! -$${Math.abs(winnings)}`);
                            embed.setColor('#FF0000');
                        }
                        
                        embed.setDescription(`Current Balance: $${user.balance}`);
                        embed.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        await interaction.followUp({ embeds: [embed] });
                        await updateFinancialStatus(interaction);
                    }
                    else {
                        const scenario = 'twoinrow';
                        const multiplier = payoutMatrix[twoEmojisInARow][scenario];
                        const winnings = Math.floor(bet * multiplier) - bet;
                        await user.increment('balance', { by: winnings });
                        await user.reload();
                         
                        if(winnings >= 0) {
                            embed.setTitle(`You win! Two in a row! +$${winnings}`);
                            embed.setColor('#00FF00');
                        }
                        else {
                            embed.setTitle(`You lose! Two in a row! -$${Math.abs(winnings)}`);
                            embed.setColor('#FF0000');
                        }
                        embed.setDescription(`Current Balance: $${user.balance}`);
                        embed.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        await interaction.followUp({ embeds: [embed] });
                        await updateFinancialStatus(interaction);
                    }
                }
                else {
                    await user.decrement('balance', { by: bet });
                    await user.reload();
                    

                    embed.setTitle(`You lose! -$${bet}`);
                    embed.setDescription(`Current Balance: $${user.balance}`);
                    embed.setColor('#FF0000');
                    embed.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    await interaction.followUp({ embeds: [embed] });
                    await updateFinancialStatus(interaction);
                }
                }
            // Generate the slots result

        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    
    }
}

async function playSlots(interaction) {

    // Add weights
    const emojiIds = [
        '1066045471161856200',
        '847263523537289236',
        '1050202826019700766',
        '1051031219011330098',
        '782114477201555456',
        '1101329646655651921',
        '1145255369606709329'
    ];
    let result = [];
    const cumulativeWeights = [];
    let cumalativeSum = 0;
    const weights = [1, 1, 1, 1, 1, 1, 0.5];

    for (let i = 0; i < weights.length; i++) {
        cumalativeSum += weights[i];
        cumulativeWeights.push(cumalativeSum);
    }
    // const testEmojis = ['<a:raresheep:1145255369606709329>', '<a:raresheep:1145255369606709329>', '<a:raresheep:1145255369606709329>', '<a:raresheep:1145255369606709329>', '<a:raresheep:1145255369606709329>', '<a:raresheep:1145255369606709329>'];
    for (let i = 0; i < 5; i++) {
        const randomValue = Math.random() * cumalativeSum;
        let emojiId;
        let emoji;
        for (let j = 0; j < cumulativeWeights.length; j++) {
            if (randomValue < cumulativeWeights[j]) {
                emojiId = emojiIds[j];
                emoji = interaction.guild.emojis.cache.get(emojiId);
                break;
            }
        }
        
        if (emoji) {
            if (emoji.animated) {
                result.push(`<a:${emoji.name}:${emojiId}>`);
            } else {
                result.push(`<:${emoji.name}:${emojiId}>`);
            }
            // result.push(emojiId[randomIndex]);
        } else {
            console.error(`Emoji with ID ${emojiId} not found.`);
            result.push('❓');
        }
        await delay(500);
        // result.push(testEmojis[i]);
        await interaction.editReply(` ${result.join(' ')} `);

        
    }

    

        // Edit the initial reply with the updated content

    

    return result;
}

function TwoPairs(result) {

    const emojiCounts = {};
    const pairs = [];

    // for (const emoji of result) {
    //     if (emojiCounts[emoji]) {
    //         emojiCounts[emoji]++;
    //         if (emojiCounts[emoji] === 2) {
    //             pairs.push(emoji);
    //             emojiCounts[emoji] = 0;
    //         }
    //     } else {
    //         emojiCounts[emoji] = 1;
    //     }
    // }

    // if (pairs.length === 2) {
    //     return pairs.slice(0, 2);
    // } else {
    //     return null;
    // }

    for (let i = 0; i < result.length - 1; i++) {
        if (result[i] === result[i + 1]) {
            pairs.push(result[i]);
            i++; // Skip the next iteration since the pair has been found
        }
    }

    if (pairs.length === 2) {
        return pairs;
    } else {
        return null;
    }
}

function TwoInARow(result) {
    for (let i = 0; i < result.length - 1; i++) {
        if (result[i] === result[i + 1] && result[i + 1] !== result[i + 2] && (i === 0 || result[i - 1] !== result[i])) {
            return result[i]; // Found two matching symbols in a row
        }
    }
    return null; // No two matching symbols in a row found
}

function ThreeInARow(result) {
    for (let i = 0; i < result.length - 2; i++) {
        if (result[i] === result[i + 1] && result[i] === result[i + 2]) {
            console.log(result[i]);
            console.log(result[i + 1]);
            console.log(result[i + 2]);
            return result[i]; // Found three matching symbols in a row
        }
    }
    return null; // No three matching symbols in a row found
}

function FourInARow(result) {
    for (let i = 0; i < result.length - 3; i++) {
        if (result[i] === result[i + 1] &&
            result[i] === result[i + 2] &&
            result[i] === result[i + 3]) {
            return result[i]; // Found four matching symbols in a row
        }
    }
    return null; // No four matching symbols in a row found
}

function FiveInARow(result) {
    const referenceEmoji = result[0];

    for(let i = 1; i < result.length; i++) {
        if (result[i] !== referenceEmoji) {
            return false;
        }
    }

    return referenceEmoji;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
