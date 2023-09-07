const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Users, Items, UserItems } = require('../../models/dbObjects'); 
const { updateFinancialStatus } = require('../../helperfunctions/updateFinancialStatus');
module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('weekly')
        .setDescription('Receive a weekly bonus!'),

    async execute(interaction) {
        await interaction.deferReply({ephemeral : true});
        const userId = interaction.user.id;
        try {
            // Find the target user's data
            const user = await Users.findOne({ where: { user_id: userId } });

            if (user) {
                console.log(user.balance);
                const now = Date.now();
                
                const lastWeeklyClaim = user.last_weekly_claim;
                const timeSinceLastWeeklyClaim = now - lastWeeklyClaim;
                // const timeSinceLastWeeklyClaim = 10000000000; //test
                const oneWeek = 24 * 60 * 60 * 1000 * 7;
                if (timeSinceLastWeeklyClaim > oneWeek) {
                    await user.increment('balance', { by: 5000 });
                    await user.update({ last_weekly_claim: now });
                    await user.reload();
                    const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle(`Weekly bonus received! 5000 tipperbucks.`)
                    .setDescription(`Balance: $${user.balance}`);
                    await interaction.editReply({ embeds: [embed] });
                    await updateFinancialStatus(interaction);
                    const tableCount = await Items.count();
                    const randomItem = Math.ceil(Math.random() * tableCount);
                    const item = await Items.findOne({ where: { id: randomItem } });
                    const record = await UserItems.findOne({ where: { userUserId: userId, itemId: item.id } });
                    if (record){
                        await record.update({ quantity: record.quantity + 1 });
                        await record.reload();
                    }
                    else{
                        await user.addItem(item.id);
                    }
                    const file = new AttachmentBuilder('./assets/itemIcons/' + item.icon);
                    const itemEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle(`You have received an item! ${item.name}`)
                        .setDescription(`Description: ${item.description}`)
                        .setImage('attachment://' + item.icon);
                    await interaction.followUp({ embeds: [itemEmbed], files: [file], ephemeral: true });
                } else {
                    const timeUntilCooldown = oneWeek - timeSinceLastWeeklyClaim;
                    const timeUntilCooldownInDays = Math.round(timeUntilCooldown / 1000 / 60 / 60 / 24);
                    const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Weekly bonus is on cooldown!')
                    .setDescription('You have already received a weekly bonus. You can receive it again in ' + timeUntilCooldownInDays + ' days.');
                    await interaction.editReply({ embeds: [embed] });
                }
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('User Not Found')
                    .setDescription(`User ${targetUser.tag} is not registered.`);

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error receiving daily bonus:', error);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('An error occurred while receiving the weekly bonus.');

            await interaction.editReply({ embeds: [embed] });
        }
    },
};