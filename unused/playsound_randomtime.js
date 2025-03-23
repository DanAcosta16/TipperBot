const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joinrandom')
    .setDescription('Join voice and play sound at random intervals')
    .addIntegerOption(option =>
      option.setName('min')
        .setDescription('Minimum delay between sounds (in minutes)')
        .setMinValue(1)
    )
    .addIntegerOption(option =>
      option.setName('max')
        .setDescription('Maximum delay between sounds (in minutes)')
        .setMinValue(1)
        .setMaxValue(180)
    ),

  async execute(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return interaction.reply("You must be in a voice channel.");

    await interaction.deferReply();

    const minMinutes = interaction.options.getInteger('min') || 5;
    const maxMinutes = interaction.options.getInteger('max') || 60;

    if (minMinutes > maxMinutes) {
      return interaction.editReply(`Minimum time can't be greater than maximum time.`);
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });

    const player = createAudioPlayer();
    connection.subscribe(player);

    const soundsFolder = path.join(__dirname, '../../assets/sounds/soundboard');
    const soundFiles = fs.readdirSync(soundsFolder).filter(file => file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.ogg'));

    const playRandomSound = async () => {
      if (!soundFiles.length) return console.error("No sound files found!");
      const randomSound = soundFiles[Math.floor(Math.random() * soundFiles.length)];
      const soundPath = path.join(soundsFolder, randomSound);
      const resource = createAudioResource(soundPath);
      console.log(`Playing: ${randomSound}`);
      player.play(resource);
      return new Promise(resolve => {
        player.once(AudioPlayerStatus.Idle, () => resolve());
      });
    };

    const loopPlay = async () => {
      while (true) {
        const delayMs = Math.floor(Math.random() * ((maxMinutes - minMinutes) * 60000)) + (minMinutes * 60000);
        console.log(`Waiting ${(delayMs / 60000).toFixed(2)} minutes before next sound...`);
        await new Promise(res => setTimeout(res, delayMs));
        await playRandomSound();
      }
    };

    interaction.editReply(`Joined ${voiceChannel.name} — will play random sounds every **${minMinutes}-${maxMinutes} minutes**!`);
    loopPlay();
  }
};
