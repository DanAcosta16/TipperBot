const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../models/dbObjects');
const { EmbedBuilder } = require('discord.js');

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
    if(interaction.user.id != '175086920513093633'){
      await interaction.reply('You do not have permission to use this command.');
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    
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
        .addFields({ name: 'Suspicion Level', value: `${selectedUser.suspicion_level}`})
        .addFields({ name: 'Jail', value: `${selectedUser.isInJail}`})
        .addFields({ name: 'Financial Status', value: `${selectedUser.financial_status}`})
        .addFields({ name: 'Active Debuff', value: `${selectedUser.active_debuff}`})
        .addFields({ name: 'Active Buff', value: `${selectedUser.active_buff}`})
        .addFields({ name: 'Sentence Length', value: `${selectedUser.sentence_length}`});

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