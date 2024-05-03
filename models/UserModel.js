const { Sequelize, DataTypes, Op } = require('sequelize');
const sequelize = new Sequelize("mysql://root:radharamanlal@localhost:3306/EcommerceDB");


const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phonenumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('customer', 'admin'),
        allowNull: false
    },
    registration_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    Regularcustomer: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    orderhistory: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

(async() => {
    try {
        await sequelize.sync();
        console.log('User table created successfully!');
    } catch (error) {
        console.error('Error creating user table:', error);
    }
})();

module.exports = User;