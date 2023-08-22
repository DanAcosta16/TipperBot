const Sequelize = require('sequelize');


const seqeulize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

require('./models/Users.js')(seqeulize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

seqeulize.sync({ force }).then(async () => {
    console.log('Database synced!');
    seqeulize.close();
})