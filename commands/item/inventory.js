const { SlashCommandBuilder, ComponentType } = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, UserSelectMenuBuilder, AttachmentBuilder } = require('discord.js');
const { Users, UserItems, Items } = require('../../models/dbObjects');
const { miragePerfume, cringeInjector, intelInquirer, neckbeardsLegalTome, tipperJailCellKey,
   redditGoldBrew, tippersFedora, remove } = require('../../helperfunctions/itemUseFunctions.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View your inventory'),

async execute(interaction) {
    const channel = await interaction.guild.channels.fetch('1145943213073502318');
    // const channel = await interaction.guild.channels.fetch('1144434062287720479'); //test
    const targetUser = interaction.user;
    await interaction.deferReply({ ephemeral: true });
    try {
      // Check if the user is already registered
      const existingUser = await Users.findOne({ where: { user_id: targetUser.id } });
      

        if (existingUser) {
            // Retrieve the user's inventory items from the junction table
                // const userItems = await UserItems.findAll({ where: { userUserId: targetUser.id } });
                const userItems = await existingUser.getItems();
                console.log(userItems);
                if (userItems.length === 0) {
                  const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Inventory')
                    .setDescription('Your inventory is empty.');

                  await interaction.editReply({ embeds: [embed] });
                  return;
                }

                let currentPage = 0;
                let closeInventory = false;
                let response = await interaction.editReply({
                   embeds: [await generateEmbed(targetUser, userItems, currentPage)],
                   files: [await generateImage(userItems, currentPage)],
                   components: [generateRow(currentPage, userItems)]})
                const collectorFilter = i => i.user.id === interaction.user.id;
                while(!closeInventory){
                  const selfItems = ['Reddit GoldBrew', 'Tipper\'s Jail Cell Key', 'Tipper\'s Fedora'];
                  try {
                    let confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
                    if (!confirmation) {
                      closeInventory = true;
                      break;
                    }
                    if (confirmation.customId === 'prev') {
                      currentPage--;
                      await confirmation.update({
                        embeds: [await generateEmbed(targetUser, userItems, currentPage)],
                        files: [await generateImage(userItems, currentPage)],
                        components: [generateRow(currentPage, userItems)],
                      });
                    } else if (confirmation.customId === 'next') {
                      currentPage++;
                      await confirmation.update({
                        embeds: [await generateEmbed(targetUser, userItems, currentPage)],
                        files: [await generateImage(userItems, currentPage)],
                        components: [generateRow(currentPage, userItems)]
                      });
                    } else if (confirmation.customId === 'close') {
                      closeInventory = true;
                    } else if (confirmation.customId === 'use') {
                      console.log(userItems[currentPage].id);
                      if (selfItems.includes(userItems[currentPage].name)) {
                        if(userItems[currentPage].name === 'Reddit GoldBrew'){
                          if(existingUser.isInJail){
                            const embed = new EmbedBuilder()
                              .setColor('#FF0000')
                              .setTitle('Error')
                              .setDescription('You cannot use this item in jail.');
                            await interaction.editReply({ embeds: [embed], files: [], content: '', components: [] });
                            return;
                          }
                          await redditGoldBrew(interaction.user.id);
                          await remove(userItems[currentPage].id, interaction.user.id);
                          const brewEmbed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setTitle(`${interaction.user.username} used an item!`)       
                          await channel.send({ embeds: [brewEmbed], files: [], components: [] });
                        }
                        else if(userItems[currentPage].name === 'Tipper\'s Jail Cell Key'){
                          if(!existingUser.isInJail){
                            const embed = new EmbedBuilder()
                              .setColor('#FF0000')
                              .setTitle('Error')
                              .setDescription('You can only use this item in jail.');
                            await interaction.editReply({ embeds: [embed], files: [], content: '', components: [] });
                            return;
                          }
                          await tipperJailCellKey(interaction.user.id);
                          await remove(userItems[currentPage].id, interaction.user.id);
                          const keyEmbed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setTitle(`${interaction.user.username} used ${userItems[currentPage].name}`)
                                .setImage('attachment://' + userItems[currentPage].icon)
                                .setDescription('They have escaped from jail!');
                          await channel.send({ embeds: [keyEmbed], files: [await generateImage(userItems, currentPage)], components: [] });
                        }
                        else if(existingUser.active_buff != null){
                          console.log('nonull');
                          const yornrow = new ActionRowBuilder()
                            .addComponents(
                              new ButtonBuilder()
                                .setCustomId('yes')
                                .setLabel('Yes')
                                .setStyle(ButtonStyle.Success),
                              new ButtonBuilder()
                                .setCustomId('no')
                                .setLabel('No')
                                .setStyle(ButtonStyle.Danger),
                            );
                          const confirmEmbed = new EmbedBuilder()
                            .setColor('#0000FF')
                            .setTitle(`This will overwrite your current buff: ${existingUser.active_buff}\nAre you sure?`)
                         
                          let buffResponse = await confirmation.update({ embeds: [confirmEmbed], files: [], components: [yornrow]});
                          let yorn = await buffResponse.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 60000 });
                          if(yorn.customId === 'no'){
                            closeInventory = true;
                            break;
                          }
                          else if(yorn.customId === 'yes'){
                            //nothing
                          }

                          if(userItems[currentPage].name === 'Tipper\'s Fedora'){
                            console.log('tipperfedora');
                            await tippersFedora(interaction.user.id);
                            await remove(userItems[currentPage].id, interaction.user.id);
                            const tipEmbed = new EmbedBuilder()
                                  .setColor('#00FF00')
                                  .setTitle(`${interaction.user.username} used ${userItems[currentPage].name}`)
                                  .setDescription('The power of the reddit fedora has been activated. Their next robbery attempt will be successful.')
                                  .setImage('attachment://' + userItems[currentPage].icon);
                            await channel.send({ embeds: [tipEmbed], files: [await generateImage(userItems, currentPage)], components: [] });
                          }
                          
                        }
                        
                        
                        

                        const itemUseEmbed = new EmbedBuilder()
                            .setColor('#00FF00')
                            .setTitle(`You used ${userItems[currentPage].name}`)
                            .setImage('attachment://' + userItems[currentPage].icon);
                            await interaction.editReply({ embeds: [itemUseEmbed], files: [await generateImage(userItems, currentPage)], content: '', components: [] });
                            return;


                      }
                      else {
                        if(existingUser.isInJail){
                          const embed = new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('Error')
                            .setDescription('You cannot use this item in jail.');
                          await interaction.editReply({ embeds: [embed], files: [], content: '', components: [] });
                          return;
                        }
                        console.log('nonuseritem');
                        const userSelect = new UserSelectMenuBuilder()
                          .setCustomId('users')
                          .setPlaceholder('Select a user');
                        const row = new ActionRowBuilder()
                          .addComponents(userSelect);
                        try{
                          const userSelectPrompt =await confirmation.update({ embeds: [], content: 'Select a target', components: [row] });
                          const collector = userSelectPrompt.createMessageComponentCollector({ componentType: ComponentType.UserSelect, time: 60000 });
                          collector.on('collect', async i => {
                            console.log(i.values[0]);
                            const user = await Users.findOne({ where: { user_id: i.values[0] } });
                            if(!user){
                              const embed = new EmbedBuilder()
                                .setColor('#FF0000')
                                .setTitle('Error')
                                .setDescription('User is not registered.');
                              await interaction.editReply({ embeds: [embed], content: '', components: [] });
                              return;
                            }
                            
                            
                            const target = await interaction.guild.members.fetch(i.values[0]);
                            if(target == interaction.user.id){
                              const embed = new EmbedBuilder()
                                .setColor('#FF0000')
                                .setTitle('Error')
                                .setDescription('You cannot target yourself.');
                              await interaction.editReply({ embeds: [embed], files: [], content: '', components: [] });
                              return;
                            }
                            if(userItems[currentPage].name === 'Cryptic Cringe Injector'){
                              if(user.isInJail){
                                const error = new EmbedBuilder()
                                  .setColor('#FF0000')
                                  .setTitle('Error')
                                  .setDescription('Target is in jail.');
                                await interaction.editReply({ embeds: [error], files: [], content: '', components: [] });
                                return;
                              }
                              await cringeInjector(i.values[0]);
                              await remove(userItems[currentPage].id, interaction.user.id);
                              const injectEmbed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setTitle(`${interaction.user.username} used an item!`)       
                              await channel.send({ embeds: [injectEmbed], files: [], components: [] });
                            }
                            else if(userItems[currentPage].name === 'M\'Lady\'s Mirage Perfume'){
                              await miragePerfume(i.values[0]);
                              await remove(userItems[currentPage].id, interaction.user.id);
                              const perfEmbed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setTitle(`${interaction.user.username} used ${userItems[currentPage].name} on ${target.user.username}`)
                                .setDescription('They are in a daze and their suspicion level is now 0.')
                                .setImage('attachment://' + userItems[currentPage].icon);
                              await channel.send({ embeds: [perfEmbed], files: [await generateImage(userItems, currentPage)], components: [] });
                            }
                            else if(userItems[currentPage].name === 'Incognito Intel Inquirer'){
                              const intel = await intelInquirer(i.values[0]);
                              await remove(userItems[currentPage].id, interaction.user.id);
                              console.log("intel", intel);
                              const intelEmbed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setTitle(`You used ${userItems[currentPage].name} on ${target.user.username}`)
                                .setDescription(`Suspicion Level: ${intel[0]} \nFinancial Status: ${intel[1]} \nActive Buff: ${intel[2]}`)
                                .setImage('attachment://' + userItems[currentPage].icon);
                              await interaction.editReply({ embeds: [intelEmbed], files: [await generateImage(userItems, currentPage)], content: '', components: [] });
                              return;
                            }
                            else if(userItems[currentPage].name === 'Neckbeard\'s Legal Tome'){
                              if(!user.isInJail){
                                const error = new EmbedBuilder()
                                  .setColor('#FF0000')
                                  .setTitle('Error')
                                  .setDescription('Target is not in jail.');
                                  await interaction.editReply({ embeds: [error], files: [], content: '', components: [] });
                                  return;
                              }
                              if(user.active_debuff != null){
                                const error = new EmbedBuilder()
                                  .setColor('#FF0000')
                                  .setTitle('Error')
                                  .setDescription('Target already has a debuff active.');
                                  await interaction.editReply({ embeds: [error], files: [], content: '', components: [] });
                                  return;
                              }
                              await neckbeardsLegalTome(i.values[0]);
                              await remove(userItems[currentPage].id, interaction.user.id);
                              const tomeEmbed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setTitle(`${interaction.user.username} used ${userItems[currentPage].name} on ${target.user.username}`)
                                .setDescription('Their sentence has increased and their bail has been raised.')
                                .setImage('attachment://' + userItems[currentPage].icon);
                              await channel.send({ embeds: [tomeEmbed], files: [await generateImage(userItems, currentPage)], components: [] });

                            }
                            
                            const itemUseEmbed = new EmbedBuilder()
                            .setColor('#00FF00')
                            .setTitle(`You used ${userItems[currentPage].name} on ${target.user.username}`)
                            .setImage('attachment://' + userItems[currentPage].icon);
                            await interaction.editReply({ embeds: [itemUseEmbed], files: [await generateImage(userItems, currentPage)], content: '', components: [] });
                            return;
                          })
                          
                        } catch (error) {
                          console.error(error);
                        }
                        
                      }
                      
                    }
                  } catch (error) {
                    const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('Inventory Closed');
                
                    await interaction.editReply({ embeds: [embed] , files: [], components: []});
                  }
                  
                }

                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('Inventory Closed');
                
                await interaction.editReply({ embeds: [embed] , files: [], components: []});

                
                
        } else {
            const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Error')
            .setDescription('User is not registered.');

            await interaction.editReply({ embeds: [embed] });
        }
    } catch (error) {
      console.error('Error fetching user inventory:', error);
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription('An error occurred while fetching your inventory.');

      await interaction.editReply({ embeds: [embed] });
    }
}
};

async function generateEmbed(targetUser, userItems, pageNumber ) {
  const userItem = userItems[pageNumber];
  const record = await UserItems.findOne({ where: { userUserId: targetUser.id, itemId: userItem.id } });
  const quantity = record.quantity;
  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle('Inventory')
    .addFields({ name: `Item Name:   ${userItem.name}`, value: `Qty: ${quantity}`, inline: true })
    .addFields({ name: 'Item Description:', value: `${userItem.description}`, inline: false })
    .setImage('attachment://' + userItem.icon);
  return embed;
}

async function generateImage(userItems, pageNumber) {
  const userItem = userItems[pageNumber];
  const file = new AttachmentBuilder('./assets/itemIcons/' + userItem.icon);
  return file;
}

function generateRow(currentPage, userItems) {
  const row = new ActionRowBuilder()
      .addComponents(
          new ButtonBuilder()
              .setCustomId('prev')
              .setLabel('Previous')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(currentPage === 0),
          new ButtonBuilder()
              .setCustomId('use')
              .setLabel('Use')
              .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
              .setCustomId('next')
              .setLabel('Next')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(currentPage === userItems.length - 1),
          new ButtonBuilder()
              .setCustomId('close')
              .setLabel('Close')
              .setStyle(ButtonStyle.Danger)
              
      );
  return row;
}