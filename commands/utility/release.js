const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../models/dbObjects');
const { EmbedBuilder } = require('discord.js');
// const devId = process.env['devId'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('release')
        .setDescription('Release a user from jail')
        .addUserOption(option => option.setName('user').setDescription('Select the user').setRequired(true)),

    async execute(interaction) {
        if (interaction.user.id !== '175086920513093633') {
            await interaction.reply('You are not allowed to use this command.');
            return;
        }
        const user = interaction.options.getUser('user');

        try {
            const userRecord = await Users.findOne({ where: { user_id: user.id } });

            if (!userRecord) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('User Not Found')
                    .setDescription(`User ${user.tag} is not registered.`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            if (!userRecord.isInJail) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Error')
                    .setDescription(`User ${user.tag} is not in jail.`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            await userRecord.update({ isInJail: false });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Release')
                .setDescription(`User ${user.tag} has been released from jail.`);
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error releasing user from jail:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('An error occurred while releasing the user from jail.');

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
