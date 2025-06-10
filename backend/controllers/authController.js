const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')

dotenv.config();

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });
};

const registerUser = async (req,res,next) => {
    const {username, email, password, displayName} = req.body;

    try{
        const userExistsByEmail = await User.findOne({email});
        if(userExistsByEmail){
            res.status(400);
            throw new Error('User with this email already exists.');
        }

        const userExistsByUsername = await User.findOne({username});
        if(userExistsByUsername){
            res.status(400);
            throw new Error('Username is already taken');
        }

        const user = await User.create({
            username,
            email,
            password,
            displayName: displayName || username,
        });

        if(user){
            const token = generateToken(user._id);
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                profilePicture: user.profilePicture,
                bio: user.bio,
                createdAt: user.createdAt,
                token: token,
            });
        }
        else{
            res.status(400);
            throw new Error('Invalid user data');
        }
    }
    catch(error){
        console.error('Registration Erro:', error.message);
        res.status(res.statusCode || 500).json({message: error.message});
    }
};

const loginUser = async (req,res,next) => {
    const {emailOrUsername,password} = req.body;

    try{
        if(!emailOrUsername || !password){
            res.status(400);
            throw new Error('Please provide email/username and password');
        }

        const user = await User.findOne({
            $or: [{email: emailOrUsername.toLowerCase()}, {username: emailOrUsername.toLowerCase()}],
        }).select('+password');

        if(user && (await user.comparePassword(password))){
            const token = generateToken(user._id);
            res.status(200).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                profilePicture: user.profilePicture,
                bio: user.bio,
                createdAt: user.createdAt,
                token: token,
            });
        }
        else{
            res.status(401);
            throw new Error('Invalid email/username or password');
        }
    }
    catch(error){
        console.error('Login Error:', error.message);
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
        res.status(statusCode || 500).json({message: error.message});
    }
};

module.exports = {
    registerUser,
    loginUser,
};