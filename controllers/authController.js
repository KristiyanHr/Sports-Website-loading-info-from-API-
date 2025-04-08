const User = require('../models/user');
const bcrypt = require('bcrypt'); 

const registerForm = (req, res) => {
    res.render('auth/register', { title: 'Register', errors: [] }); 
};

// const registerUser = async (req, res) => {
//     const { username, email, password, password2 } = req.body;
//     const errors = [];

//     if(!username || !email || !password || !password2){
//         errors.push({message: 'Please enter all fields!'});
//     }else if(password !== password2){
//         errors.push({message: 'Passwords dont match!'});
//     }else if(password.length < 6){
//         errors.push({message: 'Password should be at least 6 symbols'})
//     }else if(errors.length > 0){
//         return res.render('auth/register', {title: 'Register', errors, username, email});
//     }

//     try{
//         const existingUser = await User.findOne({ $or: [{ username }, { email }] });

//         if(existingUser){
//             errors.push({message: 'User with this username or email already exists.'});
//             return res.render('auth/register', {title: 'Register', errors, username, email});
//         }

//         const newUser = new User({
//             username,
//             email,
//             password
//         });

//         await newUser.save()
//             .then(user => {
//                 // Ако запазването е успешно, пренасочваме
//                 res.redirect('/login?registration_success=true');
//                 return;
//             })
//             .catch(err => {
//                 if (err.name === 'ValidationError') {
//                     Object.values(err.errors).forEach(({ properties }) => {
//                         errors.push({ message: properties.message });
//                     });
//                     return res.render('auth/register', { title: 'Register', errors, username, email });
//                 }
//                 console.error('Грешка при запазване на потребител:', err);
//                 res.status(500).send('Грешка при запазване на потребител.');
//                 return;
//             });

//         res.redirect('/login?registration_success=true');
//         return;

//     }catch(error){
//         console.error('Error in registration!', error);
//         res.status(500).send('Error in registration!');
//     }

    
// };
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
        return res.render('auth/register', { title: 'Register', errors, username, email });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            errors.push({ message: 'User with this username or password already exists.' });
            console.log("Rendering with existing user error");
            return res.render('auth/register', { title: 'Register', errors, username, email });
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
                    return res.render('auth/register', { title: 'Register', errors, username, email });
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
    res.render('auth/login', { title: 'Login', errors: [] });
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    const errors = [];

    if (!username || !password) {
        errors.push({ message: 'Please complete all fields.' });
        return res.render('auth/login', { title: 'Login', errors });
    }

    try {

        const user = await User.findOne({ $or: [{ username }, { email: username }] });

        if (!user) {
            errors.push({ message: 'Invalid username or password.' });
            return res.render('auth/login', { title: 'Вход', errors });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error when comparing passwords:', err);
                errors.push({ message: 'Error while logging in.' });
                return res.render('auth/login', { title: 'Login', errors });
            }

            if (isMatch) {
                req.session.user = {
                    id: user._id,
                    username: user.username,
                    email: user.email
                };
                res.redirect('/dashboard?login_success=true');
                console.log('Login successful, redirecting to dashboard.');
            } else {
                errors.push({ message: 'Invalid username or password.' });
                return res.render('auth/login', { title: 'Login', errors });
            }
        });

    } catch (error) {
        console.error('Error while logging in:', error);
        errors.push({ message: 'Error while logging in.' });
        return res.render('auth/login', { title: 'Login', errors });
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

module.exports = {
    registerForm,
    registerUser,
    loginForm,
    loginUser,
    logout
}