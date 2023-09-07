
const { Sequelize } = require('sequelize');
const seqeulize = require('./database.js');
const { Users, Items, UserItems} = require('./models/dbObjects.js');

const syncDatabase = async () => {
  // Synchronize specific models with the database
  seqeulize.sync({alter: true});
  
  console.log('Database synchronized');
};

syncDatabase();