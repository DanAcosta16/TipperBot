const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Show or set the playback volume for tracks.')
        .setDMPermission(false)
        .setNSFW(false)
        .addIntegerOption((option) =>
            option
                .setName('percentage')
                .setDescription('Set volume percentage from 1% to 1000%.')
                .setMinValue(0)
                .setMaxValue(1000)
        ),
    execute: async (interaction ) => {
        await interaction.deferReply();
        const queue = useQueue(interaction.guildId);

        const volume = interaction.options.getInteger('percentage');

        if (!volume && volume !== 0) {
            const currentVolume = queue.node.volume;
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `**Playback volume**\nThe playback volume is currently set to \`${currentVolume}%\`.`
                        )
                        .setColor('00FF00')
                ]
            });
        } else if (volume < 0) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `**${embedOptions.icons.warning} Oops!**\nYou cannot set the volume to \`${volume}\`.`
                        )
                        .setColor('FF0000')
                ]
            });
        } else {
            queue.node.setVolume(volume);

            if (volume === 0) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: interaction.member.nickname || interaction.user.username,
                                iconURL: interaction.user.avatarURL()
                            })
                            .setDescription(
                                `**Audio muted**\nPlayback audio has been muted, because volume was set to \`${volume}%\`.`
                            )
                            .setColor('00FF00')
                    ]
                });
            }

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: interaction.member.nickname || interaction.user.username,
                            iconURL: interaction.user.avatarURL()
                        })
                        .setDescription(
                            `**Volume changed**\nPlayback volume has been changed to \`${volume}%\`.`
                        )
                        .setColor('00FF00')
                ]
            });
        }
    }
};