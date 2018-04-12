let loginButton;
let registerButton;

window.onload = function() {
    loginButton = document.getElementById("login-button");
    registerButton = document.getElementById("register-button");
    loginButton.addEventListener('click', function() {
        window.location.assign("login.html");
    });
    registerButton.addEventListener('click', function() {
        window.location.assign("register.html");
    });
}