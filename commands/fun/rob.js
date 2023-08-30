const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../models/dbObjects');
const { EmbedBuilder, Client} = require('discord.js');
const { updateFinancialStatus } = require('../../helperfunctions/updateFinancialStatus');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Rob tipperbucks from a user')
        .addUserOption(option => option.setName('user').setDescription('Select the user').setRequired(true)),

    async execute(interaction) {
        const robber = interaction.user;
        const victim = interaction.options.getUser('user');

        


        try {
            
            const robberUser = await Users.findOne({ where: { user_id: robber.id } });
            const victimUser = await Users.findOne({ where: { user_id: victim.id } });
            if(robberUser.isInJail) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Error')
                    .setDescription(`You can't rob someone while in jail.`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
            
            const now = Date.now();
            const last_rob_attempt = robberUser.last_rob_attempt;
            const timeSinceLastRobAttempt = now - last_rob_attempt;
            const oneDay = 1000 * 60 * 60 * 24;
            // if (timeSinceLastRobAttempt < oneDay && last_rob_attempt !== null) {
            //     const timeUntilCooldown = oneDay - timeSinceLastRobAttempt;
            //     const timeUntilCooldownInHours = Math.round(timeUntilCooldown / 1000 / 60 / 60);
            //     const embed = new EmbedBuilder()
            //         .setColor('#FF0000')
            //         .setTitle('Rob command on cooldown!')
            //         .setDescription(`You already attempted robbery today. Try again in ${timeUntilCooldownInHours} hours.`);
            //     await interaction.reply({ embeds: [embed], ephemeral: true });
            //     return;
            // }
            if (robber.id === victim.id) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Error')
                    .setDescription(`You can't rob tipperbucks from yourself.`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            if (!robberUser) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('User Not Found')
                    .setDescription(`User ${robber.tag} is not registered.`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }


            if (!victimUser) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('User Not Found')
                    .setDescription(`User ${victim.tag} is not registered.`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            if (victimUser.balance < 1) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Insufficient Funds')
                    .setDescription(`User ${victim.tag} has no tipperbucks.`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;      
            }



            const wealthRatio = victimUser.balance / robberUser.balance;
            const stolenAmountMax = Math.ceil(victimUser.balance * 0.5);
            const stolenAmountMin = Math.ceil(victimUser.balance * 0.1);
            const potentialStolenAmount = Math.ceil(victimUser.balance * wealthRatio * 0.1);
            let amount = Math.min(stolenAmountMax, potentialStolenAmount);
            if(amount < stolenAmountMin){
                amount = stolenAmountMin;
            }
            console.log('wealthRatio: ' + wealthRatio);
            console.log('stolenAmountMax: ' + stolenAmountMax);
            console.log('stolenAmountMin: ' + stolenAmountMin);
            console.log('potentialStolenAmount: ' + potentialStolenAmount);
            console.log(amount);
            
            const channel = await interaction.guild.channels.fetch('1145943213073502318');
            
            let randomValue = Math.round(Math.random() * 10);
            console.log('randomValue: ' + randomValue);
            if (wealthRatio > 2){
                randomValue += 1;
            }
            const suspicion = victimUser.suspicion_level;
            randomValue += suspicion;
            console.log('randomValue + modifiers: ' + randomValue);
            if(randomValue < 5){
                await victimUser.decrement('balance', { by: amount });
                await victimUser.reload();
                await robberUser.increment('balance', { by: amount });
                await robberUser.reload();
                const successEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle(`Robbery Successful +$${amount}`)
                    .setDescription(`Balance: $${robberUser.balance}\n${victim.tag}'s Balance: $${victimUser.balance}`);
                await interaction.reply({ embeds: [successEmbed], ephemeral: true });
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle(`${robber.tag} has successfully robbed $${amount} from ${victim.tag}`)
                    .setDescription(`${robber.tag}'s Balance: $${robberUser.balance}\n${victim.tag}'s Balance: $${victimUser.balance}`);
                await channel.send({ embeds: [embed]});
                if (!victimUser.isInJail) {
                    await victimUser.increment('suspicion_level', { by: 1 });
                    await victimUser.reload();
                    const susEmbed = new EmbedBuilder()
                        .setTitle(`Suspicion Level Raised`)
                        .setDescription(`${victim.tag}\'s suspicion level has been raised to ${victimUser.suspicion_level}.`);
                    if (victimUser.suspicion_level >= 3) {
                        susEmbed.setColor('#FF0000');
                    }
                    else if (victimUser.suspicion_level == 2) {
                        susEmbed.setColor('#FFA500');
                    }
                    else {
                        susEmbed.setColor('#FFFF00');}
                    await channel.send({ embeds: [susEmbed] });
                }

                await updateFinancialStatus(interaction, [robber, victim]);
                
                
                
            }
            else {
                if(victimUser.suspicion_level >= 3){
                    let sentence_length;
                    if (victimUser.financial_status == 3){
                        sentence_length = 3;
                    }
                    else if (victimUser.financial_status == 2){
                        sentence_length = 2;
                    }
                    else {
                        sentence_length = 1;
                    }
                   
                    await robberUser.update({ isInJail: true , initialJailTime: Date.now(), sentence_length: sentence_length});
                    await robberUser.reload();
                    const jailEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle(`**Jailed!**`)
                        .setDescription(`Tipper has caught ${robber.tag} in the act! They have been jailed.\nSuspicion level reset to 0 for ${victim.tag} and ${robber.tag}.\nPlayers in jail gain no suspicion and can be robbed without consequence for their sentence duration.`)
                        .setAuthor({ name: robber.tag, iconURL: robber.displayAvatarURL() })
                        .addFields([{ name: 'Days Until Release', value: `${robberUser.sentence_length}` }])
                    await channel.send({ embeds: [jailEmbed] });
                    await victimUser.update({ suspicion_level: 0 });
                    await victimUser.reload();
                    await robberUser.update({ suspicion_level: 0 });
                    await robberUser.reload();
                    await victim.send(`Tipper has jailed someone that attempted to rob you! Suspicion level has been reset to ${victimUser.suspicion_level}.`);
                    const jailEmbedEphemeral = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('**Jailed!**')
                        .setDescription(`Tipper has caught you in the act! You have been jailed. Days until release: ${robberUser.sentence_length}.\nType /getoutofjail to see your options.`);
                    await interaction.reply({ embeds: [jailEmbedEphemeral], ephemeral: true });
                }
                else{
                    if (victimUser.isInJail){
                        const embed = new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('Robbery Failed')
                            .setDescription(`Victim is in jail and not notified.`);
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    const robberyEmbed = new EmbedBuilder()
                        .setColor('#FFFF00')
                        .setTitle('A Robbery Attempt Has Failed')
                        .setDescription(`The victim is jailed and cannot gain suspicion.`);
                    await channel.send( { embeds: [robberyEmbed] });   
                    }
                    else{
                        const embed = new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('Robbery Failed')
                            .setDescription(`The server and victim have been alerted..`);
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                        await victimUser.increment('suspicion_level', { by: 1 });
                        await victimUser.reload();
                        await victim.send(`Someone has attempted to rob you, but failed! Your suspicion level is now at level ${victimUser.suspicion_level}, making it harder to successfully rob you.`);
                        const robberyEmbed = new EmbedBuilder()
                            .setColor('#FFFF00')
                            .setTitle('A Robbery Attempt Has Failed')
                            .setDescription(`The victim has been notified and their suspicion has been raised.`);
                        await channel.send( { embeds: [robberyEmbed] });   
                    }
                     
                }
                
            }

            await robberUser.update({ last_rob_attempt: Date.now() });

            

            
        } catch (error) {
            console.error('Error robbing money:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('An error occurred while robbing tipperbucks.');

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};




