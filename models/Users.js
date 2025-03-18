module.exports = (sequelize, DataTypes) => {
    return sequelize.define("users", {
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        balance: {
            type: DataTypes.INTEGER,
            defaultValue: 500,
            allowNull: false,
        },
        last_daily_claim: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        },
        last_weekly_claim: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        }
    }, { timestamps: false } 
    );
};
