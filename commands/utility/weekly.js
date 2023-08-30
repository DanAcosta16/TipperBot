const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Users } = require('../../models/dbObjects'); 
const { updateFinancialStatus } = require('../../helperfunctions/updateFinancialStatus');
module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('weekly')
        .setDescription('Receive a weekly bonus!'),

    async execute(interaction) {
        await interaction.deferReply();
        const userId = interaction.user.id;
        try {
            // Find the target user's data
            const user = await Users.findOne({ where: { user_id: userId } });

            if (user) {
                if (user.isInJail) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Error')
                        .setDescription('You cannot receive a weekly bonus while in jail.');
                    await interaction.editReply({ embeds: [embed] });
                    return;
                }
                console.log(user.balance);
                const now = Date.now();
                
                const lastWeeklyClaim = user.last_weekly_claim;
                const timeSinceLastWeeklyClaim = now - lastWeeklyClaim;
                const oneWeek = 24 * 60 * 60 * 1000 * 7;
                if (timeSinceLastWeeklyClaim > oneWeek) {
                    await user.increment('balance', { by: 2000 });
                    await user.update({ last_weekly_claim: now });
                    await user.reload();
                    const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle(`Weekly bonus received! 2000 tipperbucks.`)
                    .setDescription(`Balance: $${user.balance}`);
                    await interaction.editReply({ embeds: [embed] });
                    await updateFinancialStatus(interaction);
                } else {
                    const timeUntilCooldown = oneWeek - timeSinceLastWeeklyClaim;
                    const timeUntilCooldownInDays = Math.round(timeUntilCooldown / 1000 / 60 / 60 / 24);
                    const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Weekly bonus is on cooldown!')
                    .setDescription('You have already received a weekly bonus. You can receive it again in ' + timeUntilCooldownInDays + ' days.');
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
                .setDescription('An error occurred while receiving the weekly bonus.');

            await interaction.editReply({ embeds: [embed] });
        }
    },
};