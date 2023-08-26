const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../models/dbObjects');
const { EmbedBuilder } = require('discord.js');


module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Give money to a user')
        .addUserOption(option => option.setName('user').setDescription('Select the user').setRequired(true))
        .addIntegerOption((option) => 
            option
            .setName('amount')
            .setDescription('Enter the amount')
            .setRequired(true)
            .setMinValue(1)
        ),
    async execute(interaction) {
        const giver = interaction.user;
        const receiver = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        const giverUser = await Users.findOne({ where: { user_id: giver.id } });
        const receiverUser = await Users.findOne({ where: { user_id: receiver.id } });

        try{

            if (giver.id === receiver.id) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Error')
                    .setDescription(`You can't give money to yourself.`);
                await interaction.reply({ embeds: [embed] });
                return;
            }

            if (!giverUser) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('User Not Found')
                    .setDescription(`User ${giver.tag} is not registered.`);
                await interaction.reply({ embeds: [embed] });
                return;
            }
    
            if (!receiverUser) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('User Not Found')
                    .setDescription(`User ${receiver.tag} is not registered.`);
                await interaction.reply({ embeds: [embed] });
                return;
            }
    
            if (giverUser.balance < amount) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Insufficient Funds')
                    .setDescription(`Balance: $${giverUser.balance}`);
                await interaction.reply({ embeds: [embed] });
                return;
            }
    
            await receiverUser.increment('balance', { by: amount });
            await receiverUser.reload();
            await giverUser.decrement('balance', { by: amount });
            await giverUser.reload();
            
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Money Given')
                .setDescription(`${giver.tag}\'s Balance: $${giverUser.balance}\n${receiver.tag}\'s Balance: $${receiverUser.balance}`);
            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error giving money:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('An error occurred while giving money.');

            await interaction.reply({ embeds: [embed] });
        }

    }





}