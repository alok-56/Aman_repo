const { Sequelize, DataTypes, where } = require('sequelize');
const session = require('express-session');
const Product = require('../models/ProductModel');
const User = require('../models/UserModel');
const orderitem = require("../models/OrderItemModel");
const order = require("../models/OrderModel");


const orderitemcontroller = {
    async addtocart(req, res, next) {
        const { email } = req.session;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            req.flash("error", "Please register yourself.");
            return res.redirect('/userregister');
        }

        const productid = req.params.product_id;
        const user_id = user.user_id;
        try {
            const addproduct = await orderitem.create({
                product_id: productid,
                user_id: user_id,
            });

            const product = await Product.findOne({ where: { product_id: productid } });
            const checkquantity = await orderitem.findOne({ where: { product_id: productid } });
            if (product.quantityavail < checkquantity.quantity) {
                if (product.quantityavail != 0) {
                    return lessavailable = true;
                } else
                    return outofstock = true;
            }

            product.quantityavail = product.quantityavail - checkquantity.quantity;
            await product.save();

            req.flash("success", "Product added to cart successfully.");
            res.redirect("/productcollection");
        } catch (error) {
            console.error("Error adding product to cart:", error);
            req.flash("error", "Failed to add product to cart.");
            res.redirect("/productcollection");
        }
    },
    async getAllCartProducts(req, res) {
        var lessavailable = false;
        var outofstock = false;
        var notordered = true;
        const { email } = req.session;
        const user = await User.findOne({ where: { email } });
        const user_id = user.user_id;
        const cart = await orderitem.findAll({ where: { user_id } });
        const filtercart = await Promise.all(cart.map(async(cartItem) => {
            const checkorder = await order.findOne({ where: { order_item_id: cartItem.order_item_id, status: "ordered" } });
            if (!checkorder) {
                return cartItem;
            }
            return null;
        }));

        const filteredcart = filtercart.filter(cartItem => cartItem != null);

        const cartproductinfo = await Promise.all(filteredcart.map(async(cartItem) => {
            const product = await Product.findOne({
                where: {
                    product_id: cartItem.product_id
                }
            });

            const checkquantity = await orderitem.findOne({ where: { product_id: cartItem.product_id } });
            const available = product.quantityavail;
            const quantity = checkquantity.quantity;
            console.log(available, quantity);
            if (available < quantity) {
                if (available == 0) {
                    outofstock = true;
                } else {
                    lessavailable = true;
                }
            }

            return {
                cartItem,
                product,
                quantity: cartItem.quantity,
                subtotal: cartItem.productprice
            }
        }))
        res.render('cartpage', { cart: cartproductinfo, user, lessavailable, outofstock, notordered, order });
    },
    async updateQuantity(req, res) {
        const { product_id } = req.params;
        const { quantity } = req.body;

        const product = await Product.findOne({ where: { product_id } });
        const price = product.productprice;

        const subtotal = quantity * price;

        try {
            const orderItem = await orderitem.findOne({ where: { product_id } });
            if (orderItem) {
                orderItem.quantity = quantity;
                orderItem.subtotal = subtotal;
                await orderItem.save();
            } else {
                res.status(404).send("Order item not found");
            }
        } catch (error) {
            console.error("Error updating quantity:", error);
            res.status(500).send("Internal server error");
        }
    },
    async removefromcart(req, res) {
        const { product_id } = req.params;
        const { email } = req.session;
        const user = await User.findOne({ where: { email } });
        const user_id = user.user_id;
        const orderItem = await orderitem.findOne({ where: { product_id, user_id } });
        const order_item_id = orderItem.order_item_id;
        const ordermodel = await order.findOne({ where: { order_item_id } });
        orderItem.destroy();
        res.redirect('/cartpage');
    }
};

module.exports = orderitemcontroller;