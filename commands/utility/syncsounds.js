const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('syncsounds')
    .setDescription('Syncs all soundboard sounds from the server to your local folder'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guild.id;
    const botToken = process.env.DISCORD_TOKEN;

    try {
      // Step 1: Get the soundboard sounds
      const response = await axios.get(`https://discord.com/api/v10/guilds/${guildId}/soundboard-sounds`, {
        headers: {
          Authorization: `Bot ${botToken}`
        }
      });

      const sounds = response.data.items || [];
      console.log(`Found ${sounds.length} soundboard sounds`);
      const soundDir = path.join(__dirname, '../../assets/sounds/soundboard');
      if (!fs.existsSync(soundDir)) fs.mkdirSync(soundDir, { recursive: true });

      let downloaded = 0;
      let skipped = 0;

      for (const sound of sounds) {
        const safeName = sound.name.replace(/[^a-z0-9_-]/gi, '_');
        const filename = `${safeName}.ogg`;
        const filePath = path.join(soundDir, filename);

        if (fs.existsSync(filePath)) {
          console.log(`Skipping existing: ${filename}`);
          skipped++;
          continue;
        }

        const url = `https://cdn.discordapp.com/soundboard-sounds/${sound.sound_id}`;
        const writer = fs.createWriteStream(filePath);

        console.log(`Downloading: ${filename}`);
        const response = await axios.get(url, { responseType: 'stream' });
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        downloaded++;
        console.log(`Saved: ${filename}`);
      }

      await interaction.editReply(`Soundboard sync complete!\nDownloaded: ${downloaded}\nSkipped: ${skipped}`);
    } catch (err) {
      console.error("Sync failed:", err.response?.data || err.message);
      await interaction.editReply('Failed to sync soundboard sounds.');
    }
  }
};
