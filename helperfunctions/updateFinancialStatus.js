const { Users } = require('../models/dbObjects')
const { EmbedBuilder } = require('discord.js');
async function updateFinancialStatus(interaction, members = [interaction.user]) {
    
    
    const channelId = "1145943213073502318";
    const channel = interaction.guild.channels.cache.get(channelId);
    const embed = new EmbedBuilder()
    for (let i = 0; i < members.length; i++) {
        let user = members[i];
        let userRecord = await Users.findOne({ where: { user_id: user.id } });
        if (userRecord.balance < 1000) {
            if(userRecord.financial_status != 0) {
                await userRecord.update({ financial_status: 0 });
                await userRecord.reload();
                // embed.setTitle(`${user.tag}'s Financial Status Updated: **Poor**`);
                // embed.setColor('#FF0000');
                // await channel.send({ embeds: [embed] });
            }  
        } else if (userRecord.balance < 10000) {
            if(userRecord.financial_status != 1) {
                await userRecord.update({ financial_status: 1 });
                await userRecord.reload();
                // embed.setTitle(`${user.tag}'s Financial Status Updated: **Average**`);
                // embed.setColor('#FFFF00');
                // await channel.send({ embeds: [embed] });
            }    
        } else if (userRecord.balance < 100000) {
            if(userRecord.financial_status != 2) {
                await userRecord.update({ financial_status: 2 });
                await userRecord.reload();
                // embed.setTitle(`${user.tag}'s Financial Status Updated: **Wealthy**`);
                // embed.setColor('#00FF00');
                // await channel.send({ embeds: [embed] });
                
            }
        }
        else {
            if(userRecord.financial_status != 3) {
                await userRecord.update({ financial_status: 3 });
                await userRecord.reload();
                // embed.setTitle(`${user.tag}'s Financial Status Updated: **Rich**`);
                // embed.setColor('#800080');
                // await channel.send({ embeds: [embed] });
            }
        }
    }
    
        
    

    
}

module.exports = { updateFinancialStatus }