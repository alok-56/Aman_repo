require('dotenv').config()
var express = require('express');
var router = express.Router();
const { Sequelize, DataTypes, Op, where } = require('sequelize');
var sequelize = new Sequelize(`${process.env.DATABASE}://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
var UserController = require('../Controller/usercontroller');
var ProductController = require('../Controller/productcontroller');
var UserModel = require("../models/UserModel");
var ProductModel = require("../models/ProductModel");
var OrderModel = require("../models/OrderModel");
var OrderItemModel = require("../models/OrderItemModel");
var session = require('express-session');
var path = require('path');
const productcontroller = require('../Controller/productcontroller');
const User = require('../models/UserModel');
const OrderItemController = require("../Controller/orderitemcontroller");
const { render } = require('ejs');
const OrderController = require('../Controller/ordercontroller');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images')
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = new Date().toISOString().replace(/:/g, "-") + file.originalname;
        cb(null, uniqueSuffix)

    }
});

const upload = multer({ storage });



//DataBase creation
(async function createDatabase() {
    try {
        await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`);
        console.log("Database created successfully");
    } catch (error) {
        console.error("Error encountered", error);
    }
})();

/*Home Page */
router.get('/homepage', function(req, res) {
    res.render('home');
});
/*User register page */

router.get('/userregister', function(req, res) {
    res.render("userregister");
});

// Handle form submission
router.post('/createUser', UserController.createUser);

/*User Login page */

router.get('/userlogin', function(req, res) {
    res.render("userlogin");
});

router.post('/loginuser', UserController.loginUser);
router.post('/loginforcart', UserController.loginUser);

router.get('/profile', isAuthenticated, iscustomer, function(req, res, next) {
    const username = req.session.username;
    const email = req.session.email;
    const role = req.session.role;
    res.render('profile', { username: username, role: role });
});

router.post('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/homepage');
});


function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return next();
    }
    res.redirect('/userlogin');
}

function isadmin(req, res, next) {
    if (req.session.isAuthenticated && req.session.role === "admin")
        return next();
    else
        res.redirect('/profile');
}

function iscustomer(req, res, next) {
    if (req.session.isAuthenticated && req.session.role === "customer")
        return next();
    else
        res.redirect('/admindashboard');
}

router.get('/editprofile', async function(req, res) {
    const email = req.session.email;
    const user = await UserModel.findOne({
        where: {
            email
        }
    })
    res.render("editprofile", { user: user });
});


router.post('/update', UserController.updateUser);
router.post('/delete', UserController.deleteaccount);

router.get('/thankyou', function(req, res) {
    const username = req.session.username;
    res.render("thankyou", { username: username });
});

router.get('/forgotpassword', function(req, res) {
    res.render("forgotpassword");
});

router.get("/reset/:token", function(req, res) {
    const token = req.params.token;
    res.render("reset", { token });
});

router.get("/linksent", function(req, res) {
    res.render("linksent");
})

router.post("/resetpassword", UserController.forgotpassword);
router.post("/changepassword/:token", UserController.passwordreset);

/*PRODUCT TABLE */
router.get('/productcollection', async function(req, res) {

    if (req.session && req.session.email) {
        var loggedin = true;
    } else {
        var loggedin = false
    }
    const products = await ProductModel.findAll();
    for (const product of products) {
        if (product.quantityavail <= 0) {
            product.outofstock = true;
        } else {
            product.outofstock = false;
        }
    }
    res.render('productcollectionpage', { product: products, loggedin: loggedin });
});

router.post('/createproduct', upload.single('productimage'), ProductController.createproduct);
router.post('/updateproduct/:product_id', upload.single("productimage"), ProductController.updateproduct);
router.post('/deleteproduct/:product_id', ProductController.deleteproduct);
router.get('/admindashboard', isAuthenticated, isadmin, productcontroller.getAllProducts);
router.get('/customerorderlist', isadmin, OrderController.allcustomerorderlist);
router.get('/customerlist', isadmin, UserController.customerlist);
router.get('/searchproduct', productcontroller.searchproduct);
router.post('/adminsearchproduct', isadmin, productcontroller.adminsearchproduct);
router.post('/adminsearchuser', isadmin, UserController.adminsearchuser);
router.get('/addtocart/:product_id', isLoggedIn, OrderItemController.addtocart);

async function isLoggedIn(req, res, next) {
    if (!req.session || !req.session.email) {
        req.flash("error", "Please log in first.");
        return res.redirect("/userlogin");
    } else {
        const { email } = req.session;
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                req.flash("error", "User Not Registered");
                return res.redirect("/userregister");
            } else {
                return next();
            }
        } catch (error) {
            console.error("Error checking user:", error);
            req.flash("error", "An error occurred while checking user authentication.");
            return res.redirect("/userlogin");
        }
    }
}


router.get("/cartpage", isAuthenticated, OrderItemController.getAllCartProducts);
router.get("/removefromcart/:product_id", OrderItemController.removefromcart);
router.get("/orderpage", isAuthenticated, OrderController.getAllOrders);
router.post('/updatequantity/:product_id', isLoggedIn, OrderItemController.updateQuantity);
router.get('/transactionpage/:product_id', isLoggedIn, OrderController.addorder);
router.post('/confirmorder/:orderid/:pymtmethod', OrderController.confirmorder);
router.get('/cancelorder/:orderid', OrderController.cancelorder);

/*OrderItem routes */

module.exports = router;