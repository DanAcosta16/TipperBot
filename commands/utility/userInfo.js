const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../models/dbObjects');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user')
    .addUserOption((option) =>
      option.setName('user')
        .setDescription('The user to get information about')
        .setRequired(true)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    await interaction.deferReply({ ephemeral: true });
    if (interaction.user.id !== process.env.DEVELOPER_ID) {
      await interaction.editReply({ content: 'You are not allowed to use this command.'});
      return;
    }
    
    try {
      
      const selectedUser = await Users.findOne({ where: { user_id: targetUser.id } });
      await selectedUser.reload();
      if (!selectedUser) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Error')
          .setDescription('User not found.');

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('User Information')
        .addFields({ name: 'Username', value: `${selectedUser.username}`})
        .addFields({ name: 'User ID', value: `${selectedUser.user_id}`})

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching user information:', error);
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription('An error occurred while fetching user information.');

      await interaction.editReply({ embeds: [embed] });
    }
  },
};