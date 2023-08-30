const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../models/dbObjects');
const { EmbedBuilder } = require('discord.js');
const { devId } = require('../../config.json');
// const devId = process.env['devId'];

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('resetsuspicion')
        .setDescription('Reset the suspicion level of a user')
        .addUserOption(option => option.setName('user').setDescription('Select the user').setRequired(true)),

    async execute(interaction) {
        if (interaction.user.id !== devId) {
            await interaction.reply('You are not allowed to use this command.');
            return;
        }
        const userToReset = interaction.options.getUser('user');

        try {
            // Find the user in the database
            const user = await Users.findOne({ where: { user_id: userToReset.id } });

            if (!user) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('User Not Found')
                    .setDescription(`User ${userToReset.tag} is not registered.`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            // Reset the suspicion level to 0
            await user.update({ suspicion_level: 0 });
            await user.reload();
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Suspicion Level Reset')
                .setDescription(`The suspicion level of ${userToReset.tag} has been reset to ${user.suspicion_level}.`);
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error resetting suspicion level:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('An error occurred while resetting the suspicion level.');

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
