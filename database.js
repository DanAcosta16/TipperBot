const Sequelize = require('sequelize');


const seqeulize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});




module.exports = seqeulize;