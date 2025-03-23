const { SlashCommandBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply({ content: 'Pong!', flags: MessageFlags.Ephemeral });
	}
};