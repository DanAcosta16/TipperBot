const { Events, EmbedBuilder} = require('discord.js');
const { InferenceClient } = require('@huggingface/inference');
const { Users } = require('../models/dbObjects');
require('dotenv').config();

const hfClient = new InferenceClient(process.env.HF_API_KEY);

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		//if message is from a bot or a command return
        if (message.author.bot) return;
        const botContext = 'You are a discord bot called Tipper. You are essentially a cringe redditor, ' +
                        'always try to answer like a cringe redditor, who also roasts whoever he is chatting with subtly. ';
        const userPrompt = message.content;
        //respond if message includes bot @ mention
        if (message.mentions.has(process.env.CLIENT_ID)) {
            try {
                let context = botContext + 'Here is their message: '
                const aiResponse = await callChatBot(context, userPrompt);
                message.reply(aiResponse);
            } catch (error) {
                await message.reply('An error occurred while generating a response.');
            }
        }
        const randomValue = Math.random();
        const responseProbability = 0.02;
        
        //2% chance of responding
        if (randomValue < responseProbability) {
            const giftProbability = 0.20;
            const randomValue = Math.random();

            //20% chance of receiving a gift
            if (randomValue < giftProbability) {
                const targetUser = message.author;
                try {
                    const user = await Users.findOne({ where: { user_id: targetUser.id } });
    
                    if (user) {
                        await user.increment('balance', { by: 10000 });
                        await user.reload();
    
                        var context =  botContext + 'The user you are responding to is someone who just won a random gift of tipperbucks, ' +
                        'a currency used in the server primarily for gambling on slots using the /slots commmand, congratulate them. But also take in account ' +
                        'what they said to get this prize, which was: ';

                        const aiResponse = await callChatBot(context, userPrompt);

                        const animatedEmoji = "<a:raresheep:1145255369606709329>";
                        message.reply(`${animatedEmoji} CONGRATULATIONS! ${animatedEmoji} You have received 10,000 tipperbucks!` + "\n" + aiResponse);
                        const embed = new EmbedBuilder()
                            .setColor('#00FF00')
                            .setTitle('Tipper\'s Gift')
                            .setDescription(`Current Balance: $${user.balance}`);
    
                        await message.channel.send({ embeds: [embed] });
                    }
                } catch (error) {
                    console.error('Error fetching balance:', error);
                }

            } else { //If no gift is given send a random message
                try {
                    let context = botContext + 'Here is their message: '
                    const aiResponse = await callChatBot(context, userPrompt);
                    message.reply(aiResponse);
                } catch (error) {
                    await message.reply('An error occurred while generating a response.');
                }
            }
            
        }
        
	}
}

//function that is used to call to the hugging face chat bot api
async function callChatBot(context, userPrompt = "") {

    try{
        // Call the chatCompletion method from @huggingface/inference
        const chatCompletion = await hfClient.chatCompletion({
            model: process.env.HF_MODEL, 
            max_tokens: 200, 
            messages: [
                {
                role: "user",
                content: `${context} ${userPrompt}`,
                }
            ]
        });

        // Get the first choice from the chatCompletion response
        const aiResponse = chatCompletion.choices?.[0]?.message?.content ?? 'No response generated.';

        return aiResponse;
    } catch (error) {
        console.error('Error fetching chatbot response:', error);
    }



}
