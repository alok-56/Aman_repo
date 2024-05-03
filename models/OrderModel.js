const { Sequelize, DataTypes, DATE } = require('sequelize');
const sequelize = new Sequelize("mysql://root:radharamanlal@localhost:3306/EcommerceDB");
const User = require('../models/UserModel');
const Orderitem = require("../models/OrderItemModel");
const Product = require("../models/ProductModel");

const Order = sequelize.define('Order', {
    order_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    order_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Payment Pending"
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true
    }
});


Order.belongsTo(User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});

Order.belongsTo(Orderitem, {
    foreignKey: 'order_item_id',
    onDelete: 'CASCADE'
});

Order.belongsTo(Product, {
    foreignKey: 'product_id',
    onDelete: 'CASCADE'
});



(async() => {
    try {
        await sequelize.sync();
        console.log('Order table created successfully!');
    } catch (error) {
        console.error('Error creating Order table:', error);
    }
})();

module.exports = Order;