const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function authRegister(data) {
    let errors = {};// Convert empty fields to an empty string so we can use validator functions
    data.login = !isEmpty(data.login) ? data.login : "";
    data.email = !isEmpty(data.email) ? data.email : "";
    data.password = !isEmpty(data.password) ? data.password : "";
    data.password2 = !isEmpty(data.password2) ? data.password2 : "";// Login checks
    data.admin = !isEmpty(data.admin) ? data.admin : "";

    // LOGIN CHECK
    if (Validator.isEmpty(data.login)) {
        errors.login = "Login field is required";
    } else if(!Validator.isLength(data.login, { min: 5, max: 20 })) {
        errors.login = "Login must be between 5 and 20 characters";
    // EMAIL CHECK
    } if (Validator.isEmpty(data.email)) {
        errors.email = "Email field is required";
    } else if (!Validator.isEmail(data.email)) {
        errors.email = "Email is invalid";
    // CHECK PASSWORD
    } if (Validator.isEmpty(data.password)) {
        errors.password = "Password field is required";
    } if (Validator.isEmpty(data.password2)) {
        errors.password2 = "Confirm password field is required";
    } if (!Validator.equals(data.password, data.password2)) {
        errors.password2 = "Passwords must match";
    } if (Validator.isEmpty(data.admin)){
        data.admin = 0;
    } return {
        errors,
        isValid: isEmpty(errors)
    };
};
