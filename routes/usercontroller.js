// Import necessary modules
const { User } = require('../models');

// Define controller methods
const UserController = {
    // Method to create a new user
    createUser: async(req, res) => {
        try {
            // Extract user data from the request body
            const { username, email, password, role } = req.body;

            // Create a new user in the database
            const newUser = await User.create({
                username,
                email,
                password,
                role
            });

            // Return the newly created user
            res.status(201).json(newUser);
        } catch (error) {
            // Handle errors
            console.error('Error creating user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Method to retrieve user data
    getUser: async(req, res) => {
        try {
            // Retrieve user data from the database
            const users = await User.findAll();

            // Return the list of users
            res.status(200).json(users);
        } catch (error) {
            // Handle errors
            console.error('Error retrieving users:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Method to update user information
    updateUser: async(req, res) => {
        // Implement update logic here
    },

    // Method to delete a user
    deleteUser: async(req, res) => {
        // Implement delete logic here
    }
};

// Export the controller for use in routes
module.exports = UserController;