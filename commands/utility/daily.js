const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Users } = require('../../models/dbObjects'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Receive a daily bonus!'),

    async execute(interaction) {
        await interaction.deferReply();
        const userId = interaction.user.id;
        try {
            // Find the target user's data
            const user = await Users.findOne({ where: { user_id: userId } });

            if (user) {
                console.log(user.balance);
                const now = Date.now();

                const lastDailyClaim = user.last_daily_claim;
                const timeSinceLastDailyClaim = now - lastDailyClaim;
                const oneDay = 24 * 60 * 60 * 1000;
                if (timeSinceLastDailyClaim > oneDay) {
                    await user.increment('balance', { by: 500 });
                    user.last_daily_claim = now;
                    await user.reload();
                    const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle(`Daily bonus received! +$500`)
                    .setDescription(`Balance: $${user.balance}`);

                    await interaction.editReply({ embeds: [embed] });
                } else {
                    const timeUntilCooldown = oneDay - timeSinceLastDailyClaim;
                    const timeUntilCooldownInHours = Math.round(timeUntilCooldown / 1000 / 60 / 60);
                    const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Error')
                    .setDescription('You have already received a daily bonus today. You will receive it again in ' + timeUntilCooldownInHours + ' hours.');
                    await interaction.editReply({ embeds: [embed] });
                }
                
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('User Not Found')
                    .setDescription(`User ${targetUser.tag} is not registered.`);

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error receiving daily bonus:', error);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('An error occurred while receiving the daily bonus.');

            await interaction.editReply({ embeds: [embed] });
        }
    },
};