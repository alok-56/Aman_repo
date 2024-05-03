const { Sequelize, DataTypes, Op } = require('sequelize');
const sequelize = new Sequelize("mysql://root:radharamanlal@localhost:3306/EcommerceDB");

function generateproductid() {
    return Math.floor(10000000 + Math.random() * 90000000);
}

const Product = sequelize.define('Product', {
    product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    productname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    productdesc: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    productprice: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantityavail: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productimage: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

Product.beforeCreate(async(product) => {
    const existingProducts = await Product.findAll({ attributes: ['product_id'] });
    let newProductId = generateproductid();

    while (existingProducts.some(existingProduct => existingProduct.product_id === newProductId)) {
        newProductId = generateproductid();
    }

    product.product_id = newProductId;
});

(async() => {
    try {
        await sequelize.sync();
        console.log('product table created successfully!');
    } catch (error) {
        console.error('Error creating Product table:', error);
    }
})();

module.exports = Product;