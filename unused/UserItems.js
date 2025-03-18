module.exports = (sequelize, DataTypes) => {
    const UserItems = sequelize.define('UserItems', {
      userItemId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    }, { timestamps: false } 
    );
  
    return UserItems;
  };
  