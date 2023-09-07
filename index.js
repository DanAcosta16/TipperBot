// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const {Collection, Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');
// const token = process.env['token'];

const { Player } = require('discord-player');
const cron = require('node-cron');
const { Users } = require('./models/dbObjects');



// Create a new client instance
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates
    ] 
});


// ... Other imports and setup code ...

// Run the task once a day at midnight
cron.schedule('0 5 * * *', async () => {
    try {
        // Find all users in the database
        const users = await Users.findAll();
		let decreased = false;
        // Update the suspicion level for each user
        await Promise.all(users.map(async (user) => {
            if (user.suspicion_level > 0) {
                // Decrease the suspicion level by 1
                await user.update({ suspicion_level: user.suspicion_level - 1 });
				decreased = true;
            }
        }));

		const channelId = '1145943213073502318';
		const channel = client.channels.cache.get(channelId);

		if (decreased) {
			const embed = new EmbedBuilder()
				.setColor('#00FF00')
				.setTitle(`**Suspicion Level Decreased**`)
				.setDescription(`The suspicion level of everyone in the database has been decreased by 1.`);
			await channel.send({ embeds: [embed] });
			console.log('Suspicion levels updated successfully.');
		}
		

        
    } catch (error) {
        console.error('Error updating suspicion levels:', error);
    }
});

// ... Rest of your application startup code ...



const player = new Player(client);

player.events.on('playerStart', (queue, track) => {
	const durationFormat = track.raw.duration === 0 || track.duration === '0:00' ? '' : `\`${track.duration}\``;
	const embed = new EmbedBuilder()
		.setColor('#00FF00')
		.setDescription(
			`**Started playing**\n**${durationFormat} [${track.title}](${track.url})**`
		)
		.setThumbnail(track.thumbnail)

	queue.metadata.send({ embeds: [embed] });
})


// Create a new Collection
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Loop through each folder
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Loop through each file
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Read all event files
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

// Loop through each event
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	// Execute the event depending on its type
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.cooldowns = new Collection();



// Login to Discord with your client's token
client.login(token);

module.exports = client, player;
