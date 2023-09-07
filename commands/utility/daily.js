const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Users, Items, UserItems} = require('../../models/dbObjects'); 
const { updateFinancialStatus } = require('../../helperfunctions/updateFinancialStatus');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Receive a daily bonus!'),

    async execute(interaction) {
        await interaction.deferReply({ephemeral : true});
        const userId = interaction.user.id;
        try {
            // Find the target user's data
            const user = await Users.findOne({ where: { user_id: userId } });

            if (user) {
                console.log(user.balance);
                const now = Date.now();

                const last_daily_claim = user.last_daily_claim;
                console.log(last_daily_claim);
                const timeSinceLastClaim = now - last_daily_claim;
                // const timeSinceLastClaim = 10000000000; //test
                const oneDay = 1000 * 60 * 60 * 24;
                if (timeSinceLastClaim > oneDay || last_daily_claim === null) {
                    await user.increment('balance', { by: 1000 });
                    await user.update({ last_daily_claim: now });
                    await user.reload();
                    const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle(`Daily bonus received! +1000 tipperbucks`)
                    .setDescription(`Balance: $${user.balance}`);
                    await interaction.editReply({ embeds: [embed] });
                    await updateFinancialStatus(interaction);
                    const randomChance = Math.round(Math.random() * 10);
                    if (randomChance < 5){
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
                    }
                } else {
                    const timeUntilCooldown = oneDay - timeSinceLastClaim;
                    const timeUntilCooldownInHours = Math.round(timeUntilCooldown / 1000 / 60 / 60);
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Daily bonus is on cooldown!')
                        .setDescription('You have already received a daily bonus. You can receive it again in ' + timeUntilCooldownInHours + ' hours.');
                        await interaction.followUp({ embeds: [embed] });
                }
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('User Not Found')
                    .setDescription(`User ${targetUser.tag} is not registered.`);
            }
        } catch (error) {
            console.error('Error receiving daily bonus:', error);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('An error occurred while receiving the daily bonus.');

            await interaction.editReply({ embeds: [embed] });
        }
    },
};