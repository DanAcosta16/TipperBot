const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { Users } = require('../../models/dbObjects');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register to play in the casino!')
        .addUserOption(option => option.setName('user').setDescription('Select the user')),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        await interaction.deferReply();
        try {

            
            // Check if the user is already registered
            const existingUser = await Users.findOne({ where: { user_id: targetUser.id } });

            if (!existingUser) {
                // User is not registered, so add them to the database
                await Users.create({ user_id: targetUser.id, balance: 500});

                const embed = new EmbedBuilder()
                    //set color to green
                    .setColor(0x00ff00)
                    .setTitle('Registration Successful')
                    .setDescription('You have been registered with a balance of $500.')
                await interaction.editReply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Error')
                    .setDescription('You are already registered.');

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error registering user:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('An error occurred while registering.');

            await interaction.editReply({ embeds: [embed] });
        }
    },
};