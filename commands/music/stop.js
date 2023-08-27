const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the audio playback'),

    async execute(interaction) {
        await interaction.deferReply();

        const queue = useQueue(interaction.guildId);

        // Check if the bot is currently playing audio
        if (!queue || !queue.connection) {
            const embed = new EmbedBuilder()
                .setDescription('No audio is currently playing.')
                .setColor('FF0000');

            return await interaction.editReply({ embeds: [embed] });
        }

        // Stop the audio playback
        queue.connection.destroy();
        queue.tracks = [];

        const embed = new EmbedBuilder()
            .setDescription('Audio playback stopped.')
            .setColor('00FF00');

        await interaction.editReply({ embeds: [embed] });
    },
};