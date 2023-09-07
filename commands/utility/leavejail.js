const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../models/dbObjects');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { updateFinancialStatus } = require('../../helperfunctions/updateFinancialStatus');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leavejail')
        .setDescription('Leave jail or pay bail'),

    async execute(interaction) {
        await interaction.deferReply();
        const user = interaction.user;
        const channelId = "1145943213073502318";
        const channel = await interaction.client.channels.cache.get(channelId);
        try {
            const userRecord = await Users.findOne({ where: { user_id: user.id } });

            if(userRecord){
                
                if(!userRecord.isInJail){
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Error')
                        .setDescription(`You are not in jail.`);
                    await interaction.editReply({ embeds: [embed], ephemeral: true });
                    return;
                }
                const now = Date.now();
                const initialJailTime = userRecord.initialJailTime;
                const timeSinceInitialJail = now - initialJailTime;
                // const timeSinceInitialJail = 100000000;
                const sentence = (1000 * 60 * 60 * 24) * userRecord.sentence_length;
                if (timeSinceInitialJail > sentence) {
                    await userRecord.update({ isInJail: false });
                    if (userRecord.active_debuff === 'Tome') {
                        userRecord.update({ active_debuff: null });
                    }
                    await userRecord.reload();
                    const embedEphemeral = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle(`Sentence Over.`)
                        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() });
                    await interaction.editReply({ embeds: [embedEphemeral], ephemeral: true });
                    const embed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle(`${user.tag} has been released from jail.`)
                        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() });
                    await channel.send({ embeds: [embed] });
                    return;
                }

                let bailAmount = Math.ceil(userRecord.balance * 0.4);
                if(userRecord.active_debuff === 'Tome'){
                    bailAmount = Math.ceil(bailAmount * 2);
                }
                const timeUntilRelease = sentence - timeSinceInitialJail;
                const timeUntilReleaseInDays = Math.round(timeUntilRelease / 1000 / 60 / 60 / 24);
                if (bailAmount < 1000) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle(`You are too poor to pay bail. Wait for your sentence to end. You have ${timeUntilReleaseInDays} days left.`)
                    await interaction.editReply({ embeds: [embed], ephemeral: true });
                    return;
                        
                }
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('pay_yes')
                            .setLabel('Yes')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('pay_no')
                            .setLabel('No')
                            .setStyle(ButtonStyle.Danger),
                    );
                const embed = new EmbedBuilder()
                    .setColor('#0000FF')
                    .setTitle('Pay Bail')
                    .setDescription(`To get out of jail, you need to pay $${bailAmount} or wait ${timeUntilReleaseInDays} days.\nDo you want to pay bail?`)
                    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() });
                
                let response = await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });
    

                let confirmation = await response.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 60000 });
                        
                if (confirmation.customId === 'pay_yes') {
                    await userRecord.update({ balance: userRecord.balance - bailAmount, isInJail: false });
                    if (userRecord.active_debuff === 'Tome') {
                        userRecord.update({ active_debuff: null });
                    }
                    await userRecord.reload();
                    await confirmation.update({ embeds: [embed], components: [] });
                    await updateFinancialStatus(interaction);
                    const releaseEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle(`${user.tag} has payed bail and has been released from jail.`)
                        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() });
                    await channel.send({ embeds: [releaseEmbed] });

                }
                else if (confirmation.customId === 'pay_no') {
                    await confirmation.update({ embeds: [embed], components: [] });
                }

    
                
            } else {
                const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('User Not Found')
                        .setDescription(`User ${user.tag} is not registered.`);
                    await interaction.editReply({ embeds: [embed], ephemeral: true });
                    return;
            }
            
        } catch (error) {
            console.error('Error prompting user to pay bail:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('An error occurred while prompting you to pay bail.');

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
