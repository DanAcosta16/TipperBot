const { Events, EmbedBuilder} = require('discord.js');
const { clientId } = require('../config.json');
// const clientId = process.env['clientId'];
const { Users } = require('../models/dbObjects');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		//if message is from a bot or a command return
        if (message.author.bot) return;

        const responseProbability = 0.02;
        
        const randomValue = Math.random();
        const axios = require('axios');
        
        if (message.mentions.has(clientId)) {
        // grab the message content
            const content = message.content;
            let res = await axios.get(`http://api.brainshop.ai/get?bid=177445&key=x8KpEfQSmLKlIT7h&uid=177445&msg=${content}`);
            console.log(res.data.cnt);
            message.reply(res.data.cnt);
            
        }
        //respond if message includes bot @ mention
        else if (randomValue < responseProbability) {
            const giftProbability = 0.20;
            const randomValue = Math.random();
            const content = message.content;

            if (randomValue < giftProbability) {
                
                const targetUser = message.author

                try {
                    const user = await Users.findOne({ where: { user_id: targetUser.id } });

                    if (user) {
                        await user.increment('balance', { by: 10000 });
                        await user.reload();
                        console.log(user.balance);

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

            } else {
                let res = await axios.get(`http://api.brainshop.ai/get?bid=177445&key=x8KpEfQSmLKlIT7h&uid=177445&msg=${content}`);
                console.log(res.data.cnt);
                message.reply(res.data.cnt);
            }
            
        }
        
	}
}
