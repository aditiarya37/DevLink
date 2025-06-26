const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

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
  console.log('Login request received! Body:', req.body);
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

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    return next(new Error('Please provide an email address'));
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Generic response for security
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const frontendResetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const emailMessage = `You are receiving this email because you (or someone else) has requested to reset the password for your DevLink account.\n\nPlease click on the following link, or paste it into your browser to complete the process within 10 minutes:\n\n${frontendResetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'DevLink - Password Reset Request',
        message: emailMessage,
      });
      console.log(`Password reset email initiated for ${user.email}. Check Ethereal if testing.`);
      res.status(200).json({ message: 'Password reset link has been sent to your email.' });

    } catch (emailError) {
      console.error('Email sending error in forgotPassword:', emailError);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new Error('Email could not be sent at this time. Please try again later.'));
    }

  } catch(error){
        console.error('Login Error:', error.message);
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
        res.status(statusCode || 500).json({message: error.message});
    }
  }

const resetPassword = async (req, res, next) => {
  const resetTokenFromParams = req.params.resettoken;
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetTokenFromParams)
    .digest('hex');

  console.log('[RESET_PASSWORD_CONTROLLER] Received raw token from params:', resetTokenFromParams);
  console.log('[RESET_PASSWORD_CONTROLLER] Hashed token for DB lookup:', hashedToken);

  try {
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, 
    });

    console.log('[RESET_PASSWORD_CONTROLLER] User found by token:', user ? user.email : 'No user found or token expired');

    if (!user) {
      res.status(400); 
      return next(new Error('Password reset token is invalid or has expired. Please request a new one.'));
    }

    const { password } = req.body;
    if (!password || password.length < 6) {
        res.status(400);
        return next(new Error('Password must be at least 6 characters long.'));
    }

    user.password = password; 
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    console.log('[RESET_PASSWORD_CONTROLLER] Password has been reset successfully for user:', user.email);

    res.status(200).json({ message: 'Password has been reset successfully. You can now log in with your new password.' });

  } catch (error) {
    console.error('[RESET_PASSWORD_CONTROLLER] CATCH BLOCK: Error during password reset:', error.message, error.stack);
    next(error);
  }
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
};