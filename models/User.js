const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');
const Schema = mongoose.Schema;
const passwordValidator = require('password-validator');
const passwordSchema = new passwordValidator();

// checking password strength:
passwordSchema
    .is().min(10)
    .is().max(50)
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().not().spaces()

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, "Please enter an email!"],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email!']
    },
    username: {
        type: String,
        required: [true, "Please enter a username!"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please enter a password!"],
        minlength: [10, "Minimum password length is 10 characters!"]
    }
}, {
    timestamps: true
});

// hash the password:
userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

// static method to check password strength: 
userSchema.statics.checkPassword = async function (password) {
    const isValidPassword = passwordSchema.validate(password);
    let isValid = false;
    if (!isValidPassword) {
        throw Error("Weak password!");
    }
    return isValid = true;
}

// static method to login user:
userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (user) {
        // password comparing: 
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error("Incorrect password!");
    }
    throw Error("Incorrect email!");

}

const User = mongoose.model('User', userSchema);
module.exports = User;
