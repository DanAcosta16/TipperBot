const Sequelize = require('sequelize');
const sequelize = require('../database.js');
/*
 * Make sure you are on at least version 5 of Sequelize! Version 4 as used in this guide will pose a security threat.
 * You can read more about this issue on the [Sequelize issue tracker](https://github.com/sequelize/sequelize/issues/7310).
 */



const Users = require('./Users.js')(sequelize, Sequelize.DataTypes);

//This was used to give items to users but the idea was not fun but leaving here to reference
// const Items = require('./Items.js')(sequelize, Sequelize.DataTypes);
// const UserItems = require('./UserItems.js')(sequelize, Sequelize.DataTypes);


// Users.belongsToMany(Items, { through: UserItems });
// Items.belongsToMany(Users, { through: UserItems });



module.exports = { Users };