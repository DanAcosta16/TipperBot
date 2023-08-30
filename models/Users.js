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
        },
        suspicion_level: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        last_rob_attempt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        },
        isInJail: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        initialJailTime: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        },
        sentence_length: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        financial_status: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        }
    }
    );
};
