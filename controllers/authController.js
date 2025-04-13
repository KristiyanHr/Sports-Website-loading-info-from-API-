const User = require('../models/user');
const bcrypt = require('bcrypt'); 
const nodemailer = require('nodemailer');
const crypto = require('crypto')

const registerForm = (req, res) => {
    res.render('auth/register', { title: 'Register', errors: [], user: req.session.user }); 
};

const registerUser = async (req, res) => {
    const { username, email, password, password2 } = req.body;
    const errors = [];

    if (!username || !email || !password || !password2) {
        errors.push({ message: 'Моля, попълнете всички полета.' });
    }else if (password !== password2) {
        errors.push({ message: 'Паролите не съвпадат.' });
    }else if (password.length < 6) {
        errors.push({ message: 'Паролата трябва да бъде поне 6 символа.' });
    }else if (errors.length > 0) {
        console.log("Rendering with initial errors");
        return res.render('auth/register', { title: 'Register', errors, username, email, user: req.session.user });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            errors.push({ message: 'User with this username or password already exists.' });
            console.log("Rendering with existing user error");
            return res.render('auth/register', { title: 'Register', errors, username, email, user: req.session.user });
        }

        const newUser = new User({
            username,
            email,
            password
        });

        await newUser.save()
            .then(user => {
                console.log("Redirecting after successful save");
                res.redirect('/login?registration_success=true');
                return;
            })
            .catch(err => {
                if (err.name === 'ValidationError') {
                    Object.values(err.errors).forEach(({ properties }) => {
                        errors.push({ message: properties.message });
                    });
                    console.log("Rendering with Mongoose validation error");
                    return res.render('auth/register', { title: 'Register', errors, username, email, user: req.session.user});
                }
                console.error('Error when saving user:', err);
                console.log("Sending 500 for save error");
                res.status(500).send('Error when saving user.');
                return;
            });

    } catch (error) {
        console.error('Error when saving user:', error);
        console.log("Sending 500 for pre-save error");
        res.status(500).send('Error when saving user.');
        return;
    }
};

const loginForm = (req, res) => {
    res.render('auth/login', { title: 'Login', errors: [], user: req.session.user});
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    const errors = [];

    if (!username || !password) {
        errors.push({ message: 'Please complete all fields.' });
        return res.render('auth/login', { title: 'Login', errors, user: req.session.user });
    }

    try {

        const user = await User.findOne({ $or: [{ username }, { email: username }] });

        if (!user) {
            errors.push({ message: 'Invalid username or password.' });
            return res.render('auth/login', { title: 'Login', errors, user: req.session.user });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error when comparing passwords:', err);
                errors.push({ message: 'Error while logging in.' });
                return res.render('auth/login', { title: 'Login', errors, user: req.session.user });
            }

            if (isMatch) {
                req.session.user = {
                    id: user._id,
                    username: user.username,
                    email: user.email
                };
                req.session.save(err => { // Изрично запазване на сесията
                    if (err) {
                        console.error('Error saving session:', err);
                        return res.redirect('/login'); // Обработете грешката според нуждите
                    }
                    res.redirect('/dashboard?login_success=true');
                    console.log('Login successful, redirecting to dashboard.');
                });
                return; // Добавете return, за да предотвратите изпълнението на следващия код
            } else {
                errors.push({ message: 'Invalid username or password.' });
                return res.render('auth/login', { title: 'Login', errors, user: req.session.user });
            }
        });

    } catch (error) {
        console.error('Error while logging in:', error);
        errors.push({ message: 'Error while logging in.' });
        return res.render('auth/login', { title: 'Login', errors, user: req.session.user });
    }
};

const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error when loggin out:', err);
            return res.redirect('/dashboard'); 
        }
        res.redirect('/login'); 
    });
};

const forgotPasswordForm = (req, res) => {
    res.render('auth/forgot-password', { title: 'Forgotten password', errors: [], user: req.user });
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const errors = [];

    if (!email) {
        errors.push({ message: 'Please enter valid email address.' });
        return res.render('auth/forgot-password', { title: 'Forgotten password', errors , user: req.user });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            errors.push({ message: 'User with this email is not existing.' });
            return res.render('auth/forgot-password', { title: 'Forgotten password', errors, user: req.user });
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false, 
            auth: {
                user: 'apikey', 
                pass: process.env.SENDGRID_API_KEY 
            }
        });

        const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}`;

        const mailOptions = {
            to: email,
            from: 'sportswebsitehelpmail@gmail.com',
            subject: 'Request for reseting your password',
            html: `
                <p>Hello,</p>
                <p>We have received a request to reset the password for your SportWebsite account.</p>
                <p>Please click on the following link to reset your password:</p>
                <p><a href="${resetUrl}">Click this link to go to reset page</a></p>
                <p>The link will be active for 1 hour.</p>
                <p>If you did not make this request, you can ignore this email or contact us at <a href="mailto:sportswebsitehelpmail@gmail.com">sportswebsitehelpmail@gmail.com</a>.</p>
                <p>Best regards,<br>The SportWebsite Team</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error when sending the email:', error);
                errors.push({ message: 'There was an error when sending the email. Please try again later.' });
                return res.render('auth/forgot-password', { title: 'Forgotten password', errors , user: req.user });
            } else {
                console.log('Email sent:', info.response);
                res.redirect('/login?reset_request_sent=true');
            }
        });

    } catch (error) {
        console.error('Error while reseting the password:', error);
        errors.push({ message: 'Error. Please try again later.' });
        return res.render('auth/forgot-password', { title: 'Forgotten password', errors , user: req.user });
    }
};

const resetPasswordForm = async (req, res) => {
    const { token } = req.params;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error', 'The token has expired or it is invalid.');
            return res.redirect('/login');
        }

        res.render('auth/reset-password', { title: 'Password reset', token , errors: []});
    } catch (error) {
        console.error('Error in resetPasswordForm:', error);
        req.flash('error', 'There was and error. Please try again.');
        return res.redirect('/login');
    }
};

const updatePassword = async (req, res) => {
    const { token, password, passwordConfirm } = req.body;
    const errors = [];

    if (!password || !passwordConfirm) {
        errors.push({ message: 'Please enter both passwords.' });
        return res.render('auth/reset-password', { title: 'Reset Password', token, errors });
    }

    if (password !== passwordConfirm) {
        errors.push({ message: 'Passwords do not match.' });
        return res.render('auth/reset-password', { title: 'Reset Password', token, errors });
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render('auth/login', { title: 'Login', errors: [{ 
                message: 'Password reset token is invalid or has expired.' }] });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.render('auth/login', { title: 'Login',
             success: 'Your password has been reset successfully. You can log in with your new password.', errors: [] });

    } catch (error) {
        console.error('Error while resetting password:', error);
        errors.push({ message: 'An error occurred while resetting the password. Please try again.' });
        return res.render('auth/forgot-password', { title: 'Forgot Password', errors }); 
    }
};

const profilePage = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.redirect('/dashboard');
        }
        res.render('auth/profile', { title: 'My Profile', user: req.session.user, profileData: user });
    } catch (error) {
        console.error('Error while loading profil info:', error);
        res.status(500).send('Error while loading profil info.');
    }
};
module.exports = {
    registerForm, registerUser,
    loginForm, loginUser, logout,
    forgotPasswordForm, forgotPassword,
    resetPasswordForm,
    updatePassword,
    profilePage
}   