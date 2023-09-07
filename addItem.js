const { Items } = require('./models/dbObjects');

async function createItems() {
  try {
    // Create items
    await Promise.all([
      Items.create ({ 
        name: 'M\'Lady\'s Mirage Perfume', 
        description: 'Emit a fragrance that hypnotizes your victim, reducing their ' + 
        'suspicion level to 0.',
        icon: 'perfume.png'}),
      Items.create({ name: 'Cryptic Cringe Injector', description: 'A cringe-based device that shoots a silent dart, increasing the suspicion level of ' +
      'the selected user by 3 without revealing the target. Cannot be used on yourself.', icon: 'cringe.png'}),
      Items.create({ name: 'Incognito Intel Inquirer', description: 'Allows you to extract intel from your victim such as suspicion level, financial status, and active buffs.',
        icon: 'intel.gif'}),
      Items.create({ 
        name: 'Tipper\'s Fedora', 
        description: 'Grants you the swiftness of Tipper, allowing you to rob someone successfully' +
        ' on your next attempt, ignoring the target\'s suspicion level.', icon: 'fedora.png'}),
      Items.create({ name: 'Neckbeard\'s Legal Tome', description: 'Increases jail sentence duration by 2 days, and increases bail amount of selected jailed user.',
        icon: 'tome.png'}),
      Items.create({ name: 'Tipper\'s Jail Cell Key', description: 'Escape from Tipper jail.', icon: 'key.png'}),
      Items.create({ name: 'Reddit GoldBrew', description: 'Increase your own suspicion level by 3.', icon: 'goldbrew.png'}),
    ]);

    console.log('Items created successfully');
  } catch (error) {
    console.error('Error creating items:', error);
  }
}

createItems();