const User = require('../models/user');
const bcrypt = require('bcrypt'); 
const nodemailer = require('nodemailer');
const crypto = require('crypto')

const registerForm = (req, res) => {
    res.render('auth/register', { title: 'Регистрация', errors: [], user: req.session.user }); 
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
        console.log("Рендиране с грешки");
        return res.render('auth/register', { title: 'Регистрация', errors, username, email, user: req.session.user });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            errors.push({ message: 'Потребител с това потребителско име или парола вече съществува.' });
            console.log("Грешка при зареждане с текущ потребител");
            return res.render('auth/register', { title: 'Регистрация', errors, username, email, user: req.session.user });
        }

        const newUser = new User({
            username,
            email,
            password
        });

        await newUser.save()
            .then(user => {
                console.log("Пренасочване след успешно запазване на потребител");
                res.redirect('/login?registration_success=true');
                return;
            })
            .catch(err => {
                if (err.name === 'ValidationError') {
                    Object.values(err.errors).forEach(({ properties }) => {
                        errors.push({ message: properties.message });
                    });
                    console.log("Грешка при зареждане с Mongoose валидация");
                    return res.render('auth/register', { title: 'Регистрация', errors, username, email, user: req.session.user});
                }
                console.error('Грешка при запазване на потребител:', err);
                console.log("Изпращане на статус (500) за грешка при запазване на потребител");
                res.status(500).send('Грешка при запазване на потребител.');
                return;
            });

    } catch (error) {
        console.error('Грешка при запазване на потребител.:', error);
        console.log("Изпращане на статус (500) за грешка преди запазване.");
        res.status(500).send('Грешка при запазване на потребител..');
        return;
    }
};

const loginForm = (req, res) => {
    res.render('auth/login', { title: 'Влизане', errors: [], user: req.session.user});
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    const errors = [];

    if (!username || !password) {
        errors.push({ message: 'Моля попълнете всички полета.' });
        return res.render('auth/login', { title: 'Влизане', errors, user: req.session.user });
    }

    try {

        const user = await User.findOne({ $or: [{ username }, { email: username }] });

        if (!user) {
            errors.push({ message: 'Невалидно потребителско име или парола.' });
            return res.render('auth/login', { title: 'Влизане', errors, user: req.session.user });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Грешка при сравнение на паролите:', err);
                errors.push({ message: 'Грешка при влизане.' });
                return res.render('auth/login', { title: 'Влизане', errors, user: req.session.user });
            }

            if (isMatch) {
                req.session.user = {
                    id: user._id,
                    username: user.username,
                    email: user.email
                };
                req.session.save(err => {
                    if (err) {
                        console.error('Грешка при запазване на сесията:', err);
                        return res.redirect('/login');
                    }
                    res.redirect('/dashboard?login_success=true');
                    console.log('Успешно влизане, пренасочване към потребителската страница.');
                });
                return; 
            } else {
                errors.push({ message: 'Невалидно потребителско име или парола.' });
                return res.render('auth/login', { title: 'Влизане', errors, user: req.session.user });
            }
        });

    } catch (error) {
        console.error('Грешка при влизане:', error);
        errors.push({ message: 'Грешка при влизане.' });
        return res.render('auth/login', { title: 'Влизане', errors, user: req.session.user });
    }
};

const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Грешка при излизане:', err);
            return res.redirect('/dashboard'); 
        }
        res.redirect('/login'); 
    });
};

const forgotPasswordForm = (req, res) => {
    res.render('auth/forgot-password', { title: 'Забравена парола', errors: [], user: req.user });
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const errors = [];

    if (!email) {
        errors.push({ message: 'Моля въведете валиден ймейл адрес.' });
        return res.render('auth/forgot-password', { title: 'Забравена парола', errors , user: req.user });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            errors.push({ message: 'Не съществува потребител с този имейл.' });
            return res.render('auth/forgot-password', { title: 'Забравена Парола', errors, user: req.user });
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
            subject: 'Заявка за нулиране на парола',
            html: `
                <p>Здравейте,</p>
                <p>Получихме заявка за нулиране на паролата на вашият акаунт в SportWebsite.</p>
                <p>Моля кликнете на следващия линк за да нулирате вашата парола:</p>
                <p><a href="${resetUrl}">Това е линка за нулиране на парола</a></p>
                <p>Този линк ще бъде активен за 1 час с цел по-голяма сигурност.</p>
                <p>Ако не сте направили тази заявка, може да игнорирате този имейл, вашият акаунт не е зстрашен</p>
                <p>Ако имате въпроси, моля не се колебайте да се свържете с нас: <a href="mailto:sportswebsitehelpmail@gmail.com">sportswebsitehelpmail@gmail.com</a></p>
                <p>Благодарим ви, че използвате SportWebsite!</p>
                <p>Поздрави,<br>екипът на SportWebsite</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Грешка при изпращане на имейла!', error);
                errors.push({ message: 'Грешка при изпращане на имейла! Моля опитайте пак по-късно.' });
                return res.render('auth/forgot-password', { title: 'Забравена Парола', errors , user: req.user });
            } else {
                console.log('Email sent:', info.response);
                res.redirect('/login?reset_request_sent=true');
            }
        });

    } catch (error) {
        console.error('Грешка при нулирането на паролата:', error);
        errors.push({ message: 'Грешка, моля опитайте по-късно.' });
        return res.render('auth/forgot-password', { title: 'Забравена Парола', errors , user: req.user });
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
            req.flash('error', 'Токенът е изтекъл или не е валиден.');
            return res.redirect('/login');
        }

        res.render('auth/reset-password', { title: 'Нулиране на Парола', token , errors: []});
    } catch (error) {
        console.error('Грешка в resetPasswordForm:', error);
        req.flash('error', 'Възникна грешка. Моля опитайте отново.');
        return res.redirect('/login');
    }
};

const updatePassword = async (req, res) => {
    const { token, password, passwordConfirm } = req.body;
    const errors = [];

    if (!password || !passwordConfirm) {
        errors.push({ message: 'Моля въведете и двете пароли.' });
        return res.render('auth/reset-password', { title: 'Нулиране на Парола', token, errors });
    }

    if (password !== passwordConfirm) {
        errors.push({ message: 'Паролите не съвпадат.' });
        return res.render('auth/reset-password', { title: 'Нулиране на Парола', token, errors });
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render('auth/login', { title: 'Влизане', errors: [{ 
                message: 'Токенът за нулиране на паролата е невалиден или е изтекъл.' }] });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.render('auth/login', { title: 'Влизане',
             success: 'Паролата ви беше нулирана успешно. Може да влезете с новата си парола.', errors: [] });

    } catch (error) {
        console.error('Грешка при нулиране на парлата:', error);
        errors.push({ message: 'Възникна грешка при нулиране на паролата. Моля опитайте отново.' });
        return res.render('auth/forgot-password', { title: 'Забравена парола', errors }); 
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
        console.error('Грешка при зареждане на информация за профила:', error);
        res.status(500).send('Грешка при зареждане на информация за профила.');
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