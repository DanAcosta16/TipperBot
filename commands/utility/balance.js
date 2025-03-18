const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Users } = require('../../models/dbObjects'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Display the balance of a specific user')
        .addUserOption(option => option.setName('user').setDescription('Select the user')),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        await interaction.deferReply();
        try {
            // Find the target user's data
            const user = await Users.findOne({ where: { user_id: targetUser.id } });

            if (user) {
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle(`${targetUser.tag}'s Balance`)
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
            console.error('Error fetching balance:', error);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('An error occurred while fetching the balance.');

            await interaction.editReply({ embeds: [embed] });
        }
    },
};