let loginButton;
let registerButton;
let loginEmail;
let loginPassword;

window.onload = function() {
    loginEmail = document.getElementById("login-email");
    loginEmail.focus();
    loginPassword = document.getElementById("login-password");
    loginButton = document.getElementById("login-button");
    registerButton = document.getElementById("register-button");
    loginButton.addEventListener('click', function() {
        login();
    });
    registerButton.addEventListener('click', function() {
        window.location.assign("register.html");
    });
    loginEmail.addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            login();
        }
    });
    loginPassword.addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            login();
        }
    });
}

login = function() {
    firebase.auth().signInWithEmailAndPassword(loginEmail.value, loginPassword.value).then(function() {
        // // If login successful, redirect the user to the main.html page
        if (firebase.auth().currentUser) {
            window.location.assign("main.html");
        } else {
            alert("Login failed");
        }
    }).catch(function(error) {
        if (error != null) {
            alert(error.message);
        }
    });
}