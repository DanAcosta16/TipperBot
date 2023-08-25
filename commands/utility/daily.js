const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Users } = require('../../models/dbObjects'); 

module.exports = {
    cooldown: 86400,
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
                
                await user.increment('balance', { by: 500 });
                await user.reload();
                const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle(`Daily bonus received! +$500`)
                .setDescription(`Balance: $${user.balance}`);

                await interaction.editReply({ embeds: [embed] });
                
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