module.exports = (sequelize, DataTypes) => {
    const Items = sequelize.define('Items', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    }, { timestamps: false } 
    );
  
    return Items;
};
  