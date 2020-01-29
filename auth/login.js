const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function authLogin(data) {
    let errors = {}; // Convert empty fields to an empty string so we can use validator functions
    data.login = !isEmpty(data.login) ? data.login : ""; // Email checks
    data.password = !isEmpty(data.password) ? data.password : ""; // Password checks

    if (Validator.isEmpty(data.login)) {
        errors.login = "Login field is required";
    } 
    if (Validator.isEmpty(data.password)) {
        errors.password = "Password field is required";
    }return {
        errors,
        isValid: isEmpty(errors)
    };
};
