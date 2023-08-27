const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Play slots game'),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            // Generate the slots result
            let result = await playSlots(interaction);

            const twoPairEmojis = TwoPairs(result);
            console.log('twoPairEmojis', twoPairEmojis);

            const twoEmojisInARow = TwoInARow(result);
            console.log('twoEmojisInARow', twoEmojisInARow);
            
            const threeEmojisInARow = ThreeInARow(result);
            console.log('threeEmojisInARow', threeEmojisInARow);

            const fourEmojisInARow = FourInARow(result);
            console.log('fourEmojisInARow', fourEmojisInARow);

            const fiveEmojisInARow = FiveInARow(result);
            console.log('fiveEmojisInARow', fiveEmojisInARow);

            const embed = new EmbedBuilder()
            if(fiveEmojisInARow) {
                embed.setTitle('Jackpot!');
            }

        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};

async function playSlots(interaction) {
    const emojiIds = ['1051031219011330098', '1050202826019700766', '1066045471161856200', '782114477201555456', '1101329646655651921'];
    let result = [];
    const testEmojis = ['<a:raresheep:1145255369606709329>  ' , '<:thanospog:782114477201555456> ', '<:handsomesquidward:1066045471161856200>', '<:booba:1066048560300298271> ', '<:booba:1066048560300298271> '];
    for (let i = 0; i < 5; i++) {
        // const randomIndex = Math.floor(Math.random() * emojiIds.length);
        // const emojiId = emojiIds[randomIndex];
        // const emoji = interaction.guild.emojis.cache.get(emojiId);

        // if (emoji) {
        //     result.push(`<:${emoji.name}:${emojiId}>`);
        // } else {
        //     console.error(`Emoji with ID ${emojiId} not found.`);
        //     result.push('❓');
        // }

        result.push(testEmojis[i]);

        // Edit the initial reply with the updated content
        await interaction.editReply(` ${result.join(' ')} `);

        await delay(500);
    }

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
        if (result[i] === result[i + 1] && result[i] !== result[i + 2]) {
            return result[i]; // Found two matching symbols in a row
        }
    }
    return null; // No two matching symbols in a row found
}

function ThreeInARow(result) {
    for (let i = 0; i < result.length - 2; i++) {
        if (result[i] === result[i + 1] && result[i] === result[i + 2]) {
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
