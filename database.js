const Sequelize = require('sequelize');


const seqeulize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const Users = require('./models/Users.js')(seqeulize, Sequelize.DataTypes);

// const force = process.argv.includes('--force') || process.argv.includes('-f');

// Users.sync({ force }).then(async () => {
//     console.log('Database synced!');
// })

Users.sync({ alter: true });
console.log('Users synced!');

module.exports = seqeulize;