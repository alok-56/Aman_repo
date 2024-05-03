const { Sequelize, DataTypes, Op, where } = require('sequelize');
var sequelize = new Sequelize("mysql://root:radharamanlal@localhost:3306");
const User = require('../models/UserModel');
const Product = require('../models/ProductModel');
const orderitem = require("../models/OrderItemModel");
const OrderModel = require("../models/OrderModel");
const { use } = require('passport');
const stripe = require("stripe")("sk_test_51P79cpSAXJjH0dmNxYgQg3leu9kihdrFcDE3iNbFQ1Ntacg5GNt7UfVvVVbYD3AWQjJGSxIOrIt9AgrkXBhVghIS00pxS5lL5g");
const flash = require("express-flash");
async function payment(orderid, orderitemid, token) {
    try {
        const paymentIntent = await stripe.paymentIntents.create({

            payment_method: token,
            confirm: true
        });
        return paymentIntent;
    } catch (error) {
        console.error('Error processing payment:', error);
        throw error;
    }
}

const OrderController = {
    async addorder(req, res) {
        const product_id = req.params.product_id;
        const addProductToCart = await Product.findOne({
            where: {
                product_id: product_id
            }
        });

        const { email } = req.session;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            alert("PLease Login First");
            return;
        }

        const user_id = user.user_id;
        const orderitemdetails = await orderitem.findOne({ where: { product_id, user_id } });
        const quantity = orderitemdetails.quantity;
        const order_item_id = orderitemdetails.order_item_id;
        const name = addProductToCart.productname;
        const price = addProductToCart.productprice;
        const desc = addProductToCart.productdesc;
        const avail = addProductToCart.quantityavail;
        const img = addProductToCart.productimage;
        const totalamount = quantity * price;
        const order_id = OrderModel.order_id;
        const status = OrderModel.status;

        if (avail < quantity) {
            return outofstock = true;
        } else
            outofstock = false;

        try {
            const addorder = await OrderModel.create({
                order_id,
                order_item_id,
                user_id,
                product_id,
                total_amount: totalamount,
                status,
                order_date: new Date()
            });
        } catch (error) {
            console.error("Error adding order:", error);
            return res.status(500).send("Error adding order.");
        }


        const getorderid = await OrderModel.findOne({ where: { order_item_id } });
        const orderid = getorderid.order_id;

        res.render('transactionpage', {
            productname: name,
            productprice: price,
            productdesc: desc,
            productimage: img,
            productquantity: quantity,
            totalamount,
            username: user.username,
            email: email,
            phonenumber: user.phonenumber,
            address: user.address,
            orderid: orderid
        });
    },

    async confirmorder(req, res) {
        const { orderid, pymtmethod } = req.params;
        const order = await OrderModel.findOne({ where: { order_id: orderid } });
        order.paymentMethod = pymtmethod;
        console.log(pymtmethod)
        order.status = "ordered";
        const orderitemid = order.order_item_id;
        const orderitemdetails = await orderitem.findOne({ where: { order_item_id: orderitemid } });
        const productid = orderitemdetails.product_id;
        const product = await Product.findOne({ where: { product_id: productid } });
        const quantity = orderitemdetails.quantity;
        product.quantityavail = product.quantityavail - quantity;
        const user_id = order.user_id;
        const user = await User.findOne({ where: { user_id: user_id } });
        user.orderhistory++;
        const userregularity = user.orderhistory;
        if (userregularity >= 15) {
            user.Regularcustomer = true;
        }
        res.render('Successfullpayment');
        await order.save();
        await product.save();
        await user.save();
    },
    async getAllOrders(req, res) {
        const { email } = req.session;
        const user = await User.findOne({ where: { email } });
        const user_id = user.user_id;
        try {
            const orders = await OrderModel.findAll({
                where: {
                    user_id,
                    status: "ordered"
                }
            });
            const orderItemIds = orders.map(order => order.order_item_id);
            console.log(orderItemIds);
            const orderItems = await orderitem.findAll({ where: { order_item_id: orderItemIds } });
            const productIds = orderItems.map(orderItem => orderItem.product_id);

            const products = await Product.findAll({ where: { product_id: productIds } });

            res.render("orderpage", { products, orders, orderItems });
        } catch (error) {
            console.error("Error fetching orders:", error);
            res.status(500).send("Error fetching orders.");
        }
    },
    async cancelorder(req, res) {
        const { orderid } = req.params;
        const ordercancel = await OrderModel.findOne({ where: { order_id: orderid } });
        ordercancel.status = "Order Cancelled";
        const orderitemid = ordercancel.order_item_id;
        const orderitemdetails = await orderitem.findOne({ where: { order_item_id: orderitemid } });
        const productid = orderitemdetails.product_id;
        const product = await Product.findOne({ where: { product_id: productid } });
        const quantity = orderitemdetails.quantity;
        product.quantityavail = product.quantityavail + quantity;
        const user_id = ordercancel.user_id;
        const user = await User.findOne({ where: { user_id: user_id } });
        user.orderhistory--;
        const userregularity = user.orderhistory;
        if (userregularity < 15) {
            user.Regularcustomer = false;
        }
        if (userregularity >= 15) {
            user.Regularcustomer = true;
        }
        product.save();
        ordercancel.save();
        res.redirect('/orderpage');

    },
    async allcustomerorderlist(req, res) {
        const orders = await OrderModel.findAll();
        const orderDetails = await Promise.all(orders.map(async(order) => {
            const orderItems = await orderitem.findAll({ where: { order_item_id: order.order_item_id } });
            return { order, orderItems, quantity: orderItems.quantity };
        }));
        res.render('customerorderlist', { orders: orderDetails, admin: req.session.username });
    }
};
module.exports = OrderController;