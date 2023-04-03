const User = require('../models/User');
const Quote = require('../models/Quote');
const jwt = require('jsonwebtoken');

// handling errors:
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: "", username: "", password: "" }

    // Weak password: 
    if (err.message === "Weak password!") {
        errors.password = "Not a strong password!";
    }

    // Incorrect email: 
    if (err.message === "Incorrect email!") {
        errors.email = "That email is not registered!";
    }

    // Incorrect email: 
    if (err.message === "Incorrect password!") {
        errors.password = "The password is incorrect!";
    }

    // duplicate values: email or username
    if (err.code === 11000) {
        if (err.keyValue.email) {
            errors.email = "That email has already registered!"
        }

        if (err.keyValue.username) {
            errors.username = "That username has already been used!"
        }

        return errors;
    }

    // user validation fail: 
    if (err.message.includes('User validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

// create a json web token:
const maxAge = 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'secret of yonca', {
        expiresIn: maxAge
    });
}

// registration page:
module.exports.register_get = (req, res) => {
    res.render('register')
}

// login page:
module.exports.login_get = (req, res) => {
    res.render('login')
}

// register a new user: 
module.exports.register_post = async (req, res) => {
    const { email, username, password } = req.body;

    // creating a new user:
    try {
        const isValid = await User.checkPassword(password);
        if (isValid) {
            const user = await User.create({ email, username, password });
            res.status(201).json({ user: user._id });
        }

        // handling error:
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

// log in to the system:
module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;
    try {
        // invoking a method: 
        const user = await User.login(email, password);

        // creating a jwt:
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });

        // handling errors:
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    Quote.deleteMany({})
        .then((result) => res.redirect('/'))
        .catch((err) => console.error(err))

}

