let loginButton;
let registerButton;

window.onload = function() {
    // If logged in, redirect user to the main page (this will not work until login state persistence works)
    if (firebaseUser) {
        window.location.assign("main.html");
    } else {
        loginButton = document.getElementById("login-button");
        registerButton = document.getElementById("register-button");
        loginButton.addEventListener('click', function() {
            window.location.assign("login.html");
        });
        registerButton.addEventListener('click', function() {
            window.location.assign("register.html");
        });
    }
}