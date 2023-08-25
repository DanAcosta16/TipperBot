const { SlashCommandBuilder, EmbedBuilder, GuildMember, Client } = require('discord.js');
const { Users } = require('../../models/dbObjects'); 
const { QueryTypes} = require('sequelize');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Display the leaderboard'),

    async execute(interaction) {
        const client = require('../../index.js');
        await interaction.deferReply();
        try {
            const sequelize = require('../../database.js');
            // Find the target user's data
            const topUsers = await sequelize.query(
                'SELECT user_id, balance FROM users ORDER BY balance DESC LIMIT 5',
                {
                  type: QueryTypes.SELECT,
                  model: Users
                }
              );
            
            if (topUsers.length > 0) {
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('Leaderboard')
                const first = await client.users.fetch(topUsers[0].user_id);
                for (let i = 0; i < topUsers.length; i++) {
                    const user = await client.users.fetch(topUsers[i].user_id);
                    embed.addFields({ name: `${i + 1}. ${user.tag}`, value: `$${topUsers[i].balance}`, inline: true}).setImage(first.displayAvatarURL());
                }

                await interaction.editReply({ embeds: [embed] });
            }

            
        
        } catch (error) {
            console.error('Error fetching leaderboard:', error);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('An error occurred while fetching the leaderboard.');

            await interaction.editReply({ embeds: [embed] });
        }
    },
};