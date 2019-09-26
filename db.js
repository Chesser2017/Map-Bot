const Sequelize = require('Sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    operatorsAliases: false,
    storage: 'database.sqlite'
})

module.exports = sequelize.define('Users', {
    user_id: {
        type: Sequelize.STRING,
        unique: true
    },
    level: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
    },
    current_xp: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    currency: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    }
})

sequelize.sync({force: true});