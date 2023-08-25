const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../models/dbObjects'); // Adjust the path to your dbInit.js file
const { EmbedBuilder } = require('discord.js');
const { devId } = require('../../config.json');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('setbalance')
        .setDescription('Set the user\'s balance to a specific amount')
        .addUserOption(option => option.setName('user').setDescription('Select the user').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('Enter the balance amount').setRequired(true)),

    async execute(interaction) {
        // Check if the user using the command is the allowed user
        if (interaction.user.id !== devId) {
            await interaction.reply('You are not allowed to use this command.');
            return;
        }

        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        try {
            // Find the target user's data
            const user = await Users.findOne({ where: { user_id: targetUser.id } });

            if (user) {
                console.log(user.balance);
                // Update the user's balance
                await user.update({ balance: amount });
                

                const updatedUser = await Users.findOne({ where: { user_id: targetUser.id } });
                console.log(updatedUser.balance);
                

                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('Balance Updated')
                    .setDescription(`Balance for ${targetUser.tag} has been set to $${user.balance}.`);

                await interaction.reply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('User Not Found')
                    .setDescription(`User ${targetUser.tag} is not registered.`);

                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error setting balance:', error);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('An error occurred while setting the balance.');

            await interaction.reply({ embeds: [embed] });
        }
    },
};