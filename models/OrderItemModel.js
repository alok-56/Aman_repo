const { Sequelize, DataTypes, Op } = require('sequelize');
const sequelize = new Sequelize("mysql://root:radharamanlal@localhost:3306/EcommerceDB");
const Product = require('../models/ProductModel');
const User = require('../models/UserModel');

function generateorderitemid() {
    return Math.floor(10000000 + Math.random() * 90000000);
}

const Orderitem = sequelize.define('OrderItem', {
    order_item_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false

    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    subtotal: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

Orderitem.belongsTo(User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
});

Orderitem.belongsTo(Product, {
    foreignKey: 'product_id',
    onDelete: 'CASCADE',
    hooks: true
});


Orderitem.beforeCreate(async(orderItem) => {
    orderItem.order_item_id = generateorderitemid();
});

(async() => {
    try {
        await sequelize.sync();
        console.log('Order Item table created successfully!');
    } catch (error) {
        console.error('Error creating Order Item table:', error);
    }
})();

module.exports = Orderitem;