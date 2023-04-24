const { SlashCommandBuilder, ChatInputCommandInteraction, Client } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a YouTube video in a voice channel'),
        async execute(interaction, client) {
        // check if the user is in a voice channel
        if (!interaction.member.voice.channel) {
            return await interaction.reply('You must be in a voice channel to use this command.');
        }

        // get the user's voice channel
        const voiceChannel = interaction.member.voice.channel;

        // check if the bot has permission to join the voice channel
        if (!voiceChannel.permissionsFor(interaction.guild.me).has('CONNECT')) {
            return await interaction.reply('I do not have permission to join your voice channel.');
        }

        // join the voice channel
        const connection = await voiceChannel.join();

        // check if the bot has permission to speak in the voice channel
        if (!voiceChannel.permissionsFor(interaction.guild.me).has('SPEAK')) {
            return await interaction.reply('I do not have permission to speak in your voice channel.');
        }

        // get the YouTube link from the user's message
        const youtubeLink = interaction.message.content.split(' ').slice(1).join(' ');

        // check if the user provided a YouTube link
        if (!youtubeLink) {
            return await interaction.reply('Please provide a YouTube link.');
        }

        // play the YouTube video
        const dispatcher = connection.play(youtubeLink);

        // reply with a confirmation message
        await interaction.reply(`Playing YouTube video: ${youtubeLink}`);
    }
};
