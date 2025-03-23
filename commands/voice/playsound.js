const { SlashCommandBuilder } = require('discord.js');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');
const { name } = require('../../events/interactionCreate');

const effects = [
    { name: 'None', value: 'none' },
    { name: 'Speed Up', value: 'speedup' },
    { name: 'Slow Down', value: 'slowdown' },
    { name: 'Delay', value: 'delay' },
    { name: 'Reverse', value: 'reverse' },
    { name: 'Bass Boost', value: 'bassboost' }
]

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playsound')
    .setDescription('Tipper joins your voice channel and plays a soundboard sound with an optional effect')
    .addStringOption(option =>
      option.setName('sound')
        .setDescription('Choose a sound')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption(option =>
      option.setName('effect')
        .setDescription('Choose an effect')
        .setRequired(false)
        .addChoices(...effects)
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    const soundsFolder = path.join(__dirname, '../../assets/sounds/soundboard');
    const files = fs.readdirSync(soundsFolder)
        .filter(file => file.endsWith('.ogg'))

    const results = files
        .filter(f => f.toLowerCase().includes(focused.toLowerCase()))
        .slice(0, 25)
        .map(name => ({ name, value: name }));

    await interaction.respond(results);
  },

  
  async execute(interaction) {
    // Check if the user is in a voice channel
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply("You must be in a voice channel to use this command.");
    }
    
    await interaction.deferReply();

    const sound = interaction.options.getString('sound');
    const effect = interaction.options.getString('effect') || 'none';

    let ffmpegFilter = '';
    switch (effect) {
        case 'speedup':
            ffmpegFilter = 'atempo=2.0';
            break;
        case 'slowdown':
            ffmpegFilter = 'atempo=0.5';
            break;
        case 'delay':
            ffmpegFilter = 'aecho=0.5:0.5:150:0.5';
            break;
        case 'reverse':
            ffmpegFilter = 'areverse';
            break;
        case 'bassboost':
            ffmpegFilter = 'bass=g=20, asubboost=boost=10:cutoff=150:dry=0.5:wet=1, acrusher=bits=4:mode=log:aa=1:mix=1';
            break;
    }

    const inputPath = path.join(__dirname, '../../assets/sounds/soundboard', sound);
    const outputPath = path.join(__dirname, '../../temp', `processed_${Date.now()}.ogg`);

    const ffmpegArgs = ['-y', '-i', inputPath];
    if (ffmpegFilter) {
        ffmpegArgs.push('-filter:a', ffmpegFilter);
    }
    ffmpegArgs.push('-vn', outputPath);

    // Create a connection to the voice channel
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator
    });
    
    // Create an audio player
    const player = createAudioPlayer();
    
    if (effect !== 'none') {
        const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);

        ffmpegProcess.on('close', (code) => {
            if (code === 0) {
                console.log('FFmpeg process completed successfully');
    
                if (fs.existsSync(outputPath)) {
                    const stats = fs.statSync(outputPath);
                    console.log(`File size: ${stats.size} bytes`);
                    if (stats.size === 0) {
                        console.log('File is empty');
                        return interaction.editReply('File is empty');
                    }
                } else {
                    console.log('Output file does not exist');
                    return interaction.editReply('Output file does not exist');
                }
    
                const resource = createAudioResource(outputPath);
                // Subscribe the connection to the player and start playback
                connection.subscribe(player);
                player.play(resource);
    
                player.on('error', error => {
                    console.error(`Audio player error: ${error.message}`);
                })
    
                // When playback finishes, cleanly disconnect from the voice channel
                player.on(AudioPlayerStatus.Idle, () => {
                    console.log('Playback finished');
                    connection.destroy();
                });
            } else {
                console.error(`FFmpeg process exited with code ${code}`);
            }
        });
    } else {
        const resource = createAudioResource(inputPath);
        // Subscribe the connection to the player and start playback
        connection.subscribe(player);
        player.play(resource);
    }


    // Respond in Discord that the sound is playing
    await interaction.editReply("Playing your sound!");
  }
};
