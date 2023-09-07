const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { Users, UserItems } = require('../../models/dbObjects');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getitem')
    .setDescription('Add an item to a user\'s inventory')
    .addUserOption(option => option.setName('user').setDescription('Select the user'))
    .addIntegerOption(option => option.setName('item_id').setDescription('Enter the item ID')),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    if(interaction.user.id != '175086920513093633'){
        await interaction.reply("You do not have permission to use this command.");
    }
    await interaction.deferReply();
    try {
      
      // Check if the user is already registered
      const existingUser = await Users.findOne({ where: { user_id: targetUser.id } });

      if (existingUser) {
        const itemId = interaction.options.getInteger('item_id');
        const record = await UserItems.findOne({ where: { userUserId: targetUser.id, itemId: itemId } });
        if (record) {
          await record.update({ quantity: record.quantity + 1 });
          await record.reload();
          const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Item Added')
            .setDescription(`Item with ID ${itemId} has been added to ${targetUser.username}'s inventory.`);
          await interaction.editReply({ embeds: [embed] });
          return;  
        }
        // Add the item to the user's inventory in the database
        await existingUser.addItem(itemId);

        const embed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle('Item Added')
          .setDescription(`Item with ID ${itemId} has been added to ${targetUser.username}'s inventory.`);

        await interaction.editReply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Error')
          .setDescription('User is not registered.');

        await interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error adding item to user inventory:', error);
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription('An error occurred while adding the item to the user\'s inventory.');

      await interaction.editReply({ embeds: [embed] });
    }
  },
};