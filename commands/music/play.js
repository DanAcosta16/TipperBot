const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { useMainPlayer, useQueue, Player} = require('discord-player');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song!')
        .addStringOption(option => option.setName('url').setDescription('Enter the youtube url').setRequired(true)),

        async execute(interaction) {
            await interaction.deferReply();
        
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Error')
                    .setDescription('You are not in a voice channel.');
                interaction.editReply({ embeds: [embed] });
                return;
            }
        
            let queue = useQueue(interaction.guildId);
            const player = useMainPlayer(interaction.guildId);
            const url = interaction.options.getString('url');
            await player.extractors.loadDefault();
            let searchResult;
            try {
                searchResult = await player.search(url, {
                    requestedBy: interaction.user
                });
            } catch (error) {
                console.error(error);
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Error')
                    .setDescription('An error occurred while searching.');
                interaction.editReply({ embeds: [embed] });
                return;
            }
        
            if (!searchResult || searchResult.tracks.length === 0) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `**No track found**\nNo results found for \`${url}\`.\n\nIf you specified a URL, please make sure it is valid and public.`
                            )
                            .setColor('FF0000')
                    ]
                });
            }
        
            let track;
            try {
                ({ track } = await player.play(interaction.member.voice.channel, searchResult, {
                    requestedBy: interaction.user,
                    nodeOptions: {
                        leaveOnEnd: true,
                        leaveOnEndCooldown: 3000,
                        leaveOnStop: true,
                        leaveOnStopCooldown: 300000,
                        maxSize: 50,
                        maxHistorySize: 100,
                        volume: 100,
                        connectionTimeout: 600000,
                        bufferingTimeout: 600000,
                        metadata: interaction.channel
                        }
                    }
                ));
            
            } catch (error) {
                console.error(error);
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Error')
                    .setDescription('An error occurred while playing.');
                interaction.editReply({ embeds: [embed] });
                return;
            }
            // console.log('Track: ', track);
            queue = useQueue(interaction.guildId);
            
            const durationFormat = track.raw.duration === 0 || track.duration === '0:00' ? '' : `\`${track.duration}\``;

            if(queue.size === 0) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name:
                                    interaction.member.nickname || interaction.member.nickname || interaction.user.username,
                                iconURL: interaction.user.avatarURL()
                            })
                            .setDescription(
                                `**Requested to play**\n**${durationFormat} [${track.title}](${track.url})**`
                            )
                            .setThumbnail(track.thumbnail)
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
                            `**Added to queue**\n**${durationFormat} [${track.title}](${track.url})**`
                        )
                        .setThumbnail(track.thumbnail)
                        .setColor('00FF00')
                ]
            });
        
            

            
        }

        
        

        
}