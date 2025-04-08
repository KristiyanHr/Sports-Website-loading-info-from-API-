// Import the User model
const User = require('../models/user');
const bcrypt = require('bcrypt'); // We'll need this for password hashing

// Function to display the registration form
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
    }

    if (password !== password2) {
        errors.push({ message: 'Паролите не съвпадат.' });
    }

    if (password.length < 6) {
        errors.push({ message: 'Паролата трябва да бъде поне 6 символа.' });
    }

    if (errors.length > 0) {
        console.log("Rendering with initial errors");
        return res.render('auth/register', { title: 'Register', errors, username, email });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            errors.push({ message: 'Потребител с такова потребителско име или имейл вече съществува.' });
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
                console.error('Грешка при запазване на потребител:', err);
                console.log("Sending 500 for save error");
                res.status(500).send('Грешка при запазване на потребител.');
                return;
            });

    } catch (error) {
        console.error('Грешка преди запазване на потребител:', error);
        console.log("Sending 500 for pre-save error");
        res.status(500).send('Грешка преди запазване на потребител.');
        return;
    }
};

module.exports = {
    registerUser,
    registerForm
}