const { SlashCommandBuilder } = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads a command.')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The command to reload.')
				.setRequired(true)),
	async execute(interaction) {
		const commandName = interaction.options.getString('command', true).toLowerCase();
		const command = interaction.client.commands.get(commandName);
		const commandFolders = fs.readdirSync(path.join(__dirname, '..'));
		for (const folder of commandFolders) {
			const commandFiles = fs.readdirSync(path.join(__dirname, '..', folder));
			for (const file of commandFiles) {
				const commandFile = require(path.join(__dirname, '..', folder, file));
				if (commandFile.data.name.toLowerCase() === commandName) {
					delete require.cache[require.resolve(path.join(__dirname, '..', folder, file))];

					try {
						interaction.client.commands.delete(commandFile.data.name);
						const newCommand = require(path.join(__dirname, '..', folder, file));
						interaction.client.commands.set(newCommand.data.name, newCommand);
						await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
					} catch (error) {
						console.error(error);
						await interaction.reply(`There was an error while reloading a command \`${commandFile.data.name}\`:\n\`${error.message}\``);
					}
				}
			}
		}
	},
};

