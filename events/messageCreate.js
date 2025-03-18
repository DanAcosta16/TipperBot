const { Events, EmbedBuilder} = require('discord.js');
require('dotenv').config();
const { Users } = require('../models/dbObjects');
module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		//if message is from a bot or a command return
        if (message.author.bot) return;      
        const randomValue = Math.random();
        const giftProbability = 0.02;
        //respond if message includes bot @ mention
        if (randomValue < giftProbability) {
                
            const targetUser = message.author

            try {
                const user = await Users.findOne({ where: { user_id: targetUser.id } });

                if (user) {
                    await user.increment('balance', { by: 10000 });
                    await user.reload();

                    message.reply("You have received $10,000! \* Tips fedora \* ");
                    const embed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('Tipper\'s Gift')
                        .setDescription(`Current Balance: $${user.balance}`);

                    await message.channel.send({ embeds: [embed] });
                }
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
            
        }
        
	}
}
