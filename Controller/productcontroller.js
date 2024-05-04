const { Sequelize, DataTypes, Op, QueryTypes, where } = require('sequelize');
const Product = require("../models/ProductModel");
const flash = require("express-flash");
const path = require("path");
const usercontroller = require("../Controller/usercontroller");
const User = require('../models/UserModel');
const orderitem = require("../models/OrderItemModel");
const router = require('../routes');
const { promiseImpl } = require('ejs');
const Order = require('../models/OrderModel');

const productcontroller = {
    async createproduct(req, res) {
        try {
            const { productid, productname, productdesc, productprice, quantityavail } = req.body;
            const productimage = req.file.filename;

            const newproduct = await Product.create({
                productid,
                productname,
                productprice,
                productdesc,
                quantityavail,
                productimage
            });
            req.session.productname = productname;
            req.session.productprice = productprice;
            req.session.quantityavail = quantityavail;
            req.session.productdesc = productdesc;
            req.session.product_id = newproduct.product_id;
            req.session.productimage = productimage;
            res.redirect("/admindashboard");
        } catch (err) {
            console.log("Error in creating product", err);
        }
    },
    async updateproduct(req, res) {
        const { product_id } = req.params;
        const { productname, productprice, quantityavail, productdesc } = req.body;
        const image = req.file ? req.file.filename : null;
        try {
            const product = await Product.findOne({ where: { product_id: product_id } });
            if (productname) {
                product.productname = productname;
            }
            if (productprice) {
                product.productprice = productprice;
            }
            if (productdesc) {
                product.productdesc = productdesc;
            }
            if (quantityavail) {
                product.quantityavail = quantityavail;
            }
            if (image) {
                product.productimage = image; // Use the uploaded file name
            }
            await product.save();
            res.redirect('/admindashboard');
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllProducts(req, res) {
        try {
            const products = await Product.findAll();
            res.render('admindashboard', { admin: req.session.username, products: products });
        } catch (err) {
            console.log("Error fetching products", err);
            res.status(500).send("Error fetching products");
        }
    },

    async searchproduct(req, res) {
        try {
            const { searchthisproduct } = req.query;
            const search = {
                where: {
                    productname: searchthisproduct
                }

            }

            const searching = await Product.findAll(search);

            if (searching.length === 0) {
                res.flash("error", "'No products found' ");
                res.redirect('/productcollection');

            } else {
                // Render the view with the search results
                res.render('productcollectionpage', { product: searching });
            }
        } catch (err) {
            res.send(err);
        }
    },
    async adminsearchproduct(req, res) {
        try {
            const { searchthisproduct } = req.body;

            const products = await Product.findByPk(searchthisproduct);

            if (!products) {
                res.flash("error", "'No products found' ");
                res.redirect('/admindashboard');

            } else {
                res.render('admindashboard', { admin: req.session.username, products: [products] });
            }
        } catch (err) {
            res.send(err);
        }
    },

    async deleteproduct(req, res) {
        try {
            const { product_id } = req.params;
            const deleteThisProduct = await Product.findOne({
                where: {
                    product_id: product_id
                }
            });
            await Order.destroy({ where: { product_id } });
            await orderitem.destroy({ where: { product_id } });

            if (deleteThisProduct)
                await deleteThisProduct.destroy();
            else {
                res.status(404).send("Product not found");
            }
            res.redirect("/admindashboard")
        } catch (error) {
            console.log("Error deleting product", error);
            res.status(500).send("Error deleting product");
        }
    },

    async transactionpage(req, res) {
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
        const productamount = addProductToCart.productprice;
        const totalamount = quantity * price;
        const order_id = OrderModel.order_id;
        const addorder = await OrderModel.create({
            order_id,
            order_item_id,
            user_id,
            total_amount: totalamount,
            status: "ordered",
            order_date: new Date()
        });



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
            address: user.address
        });
    }
};

module.exports = productcontroller;