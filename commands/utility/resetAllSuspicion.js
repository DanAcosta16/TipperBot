const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../models/dbObjects');
const { EmbedBuilder } = require('discord.js');
const { devId } = require('../../config.json');
// const devId = process.env['devId'];

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('resetallsuspicion')
        .setDescription('Reset the suspicion level of everyone in the database'),

    async execute(interaction) {
        if (interaction.user.id !== devId) {
            await interaction.reply('You are not allowed to use this command.');
            return;
        }
        try {
            // Find all users in the database
            const users = await Users.findAll();

            // Reset the suspicion level to 0 for each user
            await Promise.all(users.map(user => user.update({ suspicion_level: 0 })));

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Suspicion Level Reset')
                .setDescription('The suspicion level of everyone in the database has been reset to 0.');
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error resetting suspicion levels:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('An error occurred while resetting the suspicion levels.');

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
