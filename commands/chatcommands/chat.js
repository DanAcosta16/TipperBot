const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('chat')
		.setDescription('Talk with Tipper!')
		.addStringOption(option => option.setName('message').setDescription('The message to send').setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();

		try {

			const axios = require('axios');
			let res = await axios.get(`http://api.brainshop.ai/get?bid=177445&key=x8KpEfQSmLKlIT7h&uid=177445&msg=${interaction.options.getString('message')}`);
			console.log(res.data.cnt);
			interaction.editReply(res.data.cnt);	

		}
		catch (err) {
			const embed = new EmbedBuilder()
				.setColor('#FF0000')
				.setTitle('Error')
				.setDescription('An error occurred while chatting.');
			interaction.editReply({ embeds: [embed] });
		}
	}
};