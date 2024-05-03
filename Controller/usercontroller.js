// Import necessary modules
const { Sequelize, DataTypes, Op, where } = require('sequelize');
const User = require('../models/UserModel');
const crypto = require("crypto");
const flash = require('express-flash');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'avikasaxena1923@gmail.com',
        pass: 'ozgj qrjy vhwe nwkh'
    }
});

const orderitem = require("../models/OrderItemModel");
const Order = require('../models/OrderModel');

async function sendPasswordResetEmail(email, token) {
    try {
        await transporter.sendMail({
            from: 'avikasaxena1923@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n` +
                `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                `http://localhost:5000/reset/${token}\n\n` +
                `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        });
    } catch (error) {
        console.error('Error sending password reset email:', error);
    }
}
// Define controller methods
const UserController = {
    async createUser(req, res) {
        try {
            const { username, email, password, phonenumber, address, gender, role } = req.body;

            var useremail = await User.findOne({ where: { email: email } });
            if (useremail) {
                req.flash("error", "Email already exist");
                return res.redirect('/userregister');
            }

            const newuser = await User.create({
                username,
                email,
                password,
                phonenumber,
                address,
                gender,
                role
            });
            res.redirect("/userlogin");
        } catch (error) {
            console.log("error found ,error", error);
        }

    },

    async loginUser(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ where: { email: email } });
            if (user) {
                const isPasswordValid = (password == user.password);
                if (isPasswordValid) {
                    req.session.isAuthenticated = true;
                    req.session.email = user.email;
                    req.session.username = user.username;
                    req.session.role = user.role;
                    user.last_login = new Date();
                    const order = await Order.findAll({ where: { user_id: user.user_id, status: "ordered" } });
                    if (order.length >= 15) {
                        user.Regularcustomer = true;
                    }
                    await user.save();
                    if (user.role === "admin")
                        res.redirect("/admindashboard");
                    else
                        res.redirect('/profile');
                } else {
                    req.session.isAuthenticated = false;
                    req.flash("error", "Incorrect password or email")
                    res.redirect("/userlogin");
                }
            }
        } catch (error) {
            console.log("error : ", error);
        }
    },
    async loginForCart(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email: email } });
            if (user) {
                const isPasswordValid = (password == user.password);
                if (isPasswordValid) {
                    req.session.isAuthenticated = true;
                    user.last_login = new Date();
                    await user.save();
                    res.redirect('/productcollectionpage');
                } else {
                    req.session.isAuthenticated = false;
                    req.flash("error", "Incorrect password or email")
                    res.redirect("/userlogin");
                }
            }
        } catch (error) {
            console.log("error : ", error);
        }
    },

    async updateUser(req, res) {
        try {
            // Assuming you have already authenticated the user and obtained their username and email
            const { username, email, phonenumber, address, gender } = req.session;
            const { newusername, newemail, newphno, newaddress, newgender } = req.body;
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (newusername) {
                user.username = newusername;
                await user.save();
            }

            if (newemail) {
                user.email = newemail;
                await user.save();
            }

            if (newphno) {
                user.phonenumber = newphno;
                await user.save();
            }

            if (newaddress) {
                user.address = newaddress;
                await user.save();
            }

            if (newgender) {
                user.gender = newgender;
                await user.save();
            }

            req.session.username = user.username;
            req.session.email = user.email;
            req.session.phonenumber = user.phonenumber;
            req.session.address = user.address;
            req.session.gender = user.gender;

            res.redirect("/profile");
        } catch (error) {
            console.log('Error updating username:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deleteaccount(req, res) {
        try {
            const { username, email } = req.session;
            const user = await User.findOne({ where: { username, email } });
            await Order.destroy({ where: { user_id: user.user_id } });
            await orderitem.destroy({ where: { user_id: user.user_id } });
            await user.destroy();
            res.redirect("/thankyou");
        } catch (err) {
            console.log("error : ", err);
        }
    },

    async forgotpassword(req, res) {
        const { email } = req.body;
        const user = await User.findOne({ where: { email: email } });

        if (!user) {
            return res.status(404).send('User not found');
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        await sendPasswordResetEmail(email, token);
        res.redirect("/linksent");

    },

    async passwordreset(req, res) {
        const { changepassword, confirmpassword } = req.body;

        // Find user by reset token
        const user = await User.findOne({
            where: {
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    [Op.gt]: Date.now()
                }
            }
        });
        if (!user) {
            return res.status(400).send('expired reset token');
        }

        // Reset password
        if (changepassword === confirmpassword) {
            user.password = changepassword;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();
        } else
            res.send("wrong password");

        res.redirect('/userlogin');

    },
    async adminsearchuser(req, res) {
        const { searchuser } = req.body
        if (!isNaN(searchuser)) {
            const userById = await User.findByPk(searchuser);
            if (userById) {
                return res.render("customerlist", { users: [userById], admin: req.session.username });
            } else {
                // If user not found by ID, render empty array
                return res.render("customerlist", { users: [], admin: req.session.username });
            }
        } else if (searchuser.toLowerCase() === "regular customer") {
            const regularCustomers = await User.findAll({ where: { Regularcustomer: true } });
            return res.render("customerlist", { users: regularCustomers, admin: req.session.username });
        } else {
            // Assuming the search query is a string (customer name)
            const usersByName = await User.findAll({
                where: {
                    username: {
                        [Op.like]: `%${searchuser}%`
                    }
                }
            });
            return res.render("customerlist", { users: usersByName, admin: req.session.username });
        }
    },
    async customerlist(req, res) {
        const users = await User.findAll({ where: { role: "customer" } });
        res.render("customerlist", { users: users, admin: req.session.username });
    }
}

module.exports = UserController;