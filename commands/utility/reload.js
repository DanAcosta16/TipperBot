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
		const casinoCommandFiles = await fs.promises.readdir(path.join(__dirname, '..', 'casino'));
		const casinojsFiles = casinoCommandFiles.filter(file => file.endsWith('.js'));
		for (const file of casinojsFiles) {
			const commandFileName = file.slice(0, -3);
			if (commandFileName.toLowerCase() === commandName) {
				delete require.cache[require.resolve(path.join(__dirname, '..', 'casino', file))];

				try {
					interaction.client.commands.delete(command.data.name);
					const newCommand = require(path.join(__dirname, '..', 'casino', file));
					interaction.client.commands.set(newCommand.data.name, newCommand);
					await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
				} catch (error) {
					console.error(error);
					await interaction.reply(`There was an error while reloading a command \`${commandFile.data.name}\`:\n\`${error.message}\``);
				}
			}
		}
		
		const funCommandFiles = await fs.promises.readdir(path.join(__dirname, '..', 'fun'));
		const funjsFiles = funCommandFiles.filter(file => file.endsWith('.js'));
		for (const file of funjsFiles) {
			const commandFileName = file.slice(0, -3);
			if (commandFileName.toLowerCase() === commandName) {
				delete require.cache[require.resolve(path.join(__dirname, '..', 'fun', file))];

				try {
					interaction.client.commands.delete(command.data.name);
					const newCommand = require(path.join(__dirname, '..', 'fun', file));
					interaction.client.commands.set(newCommand.data.name, newCommand);
					await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
				} catch (error) {
					console.error(error);
					await interaction.reply(`There was an error while reloading a command \`${commandFile.data.name}\`:\n\`${error.message}\``);
				}
			}
		}

		const utilCommandFiles = await fs.promises.readdir(path.join(__dirname, '..', 'utility'));
		const utiljsFiles = utilCommandFiles.filter(file => file.endsWith('.js'));
		for (const file of utiljsFiles) {
			const commandFileName = file.slice(0, -3);
			if (commandFileName.toLowerCase() === commandName) {
				delete require.cache[require.resolve(path.join(__dirname, '..', 'utility', file))];

				try {
					interaction.client.commands.delete(command.data.name);
					const newCommand = require(path.join(__dirname, '..', 'utility', file));
					interaction.client.commands.set(newCommand.data.name, newCommand);
					await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
				} catch (error) {
					console.error(error);
					await interaction.reply(`There was an error while reloading a command \`${commandFile.data.name}\`:\n\`${error.message}\``);
				}
			}
		}
	}
};

