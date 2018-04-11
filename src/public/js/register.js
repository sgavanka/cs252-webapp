let registerEmail;
let registerName;
let registerPassword;
let registerConfirmPassword;
let registerButton;

window.onload = function() {
    registerEmail = document.getElementById("register-email");
    registerName = document.getElementById("register-name");
    registerPassword = document.getElementById("register-password");
    registerConfirmPassword = document.getElementById("register-confirm-password");
    registerButton = document.getElementById("register-button");
    registerButton.addEventListener("click", function() {
        register();
    });
}

register = function() {
    firebase.auth().createUserWithEmailAndPassword(registerEmail.value, registerPassword.value).then(function() {
        if (firebaseUser) {
            database.child("users").child(user.uid).set({ email: registerEmail.value, fullName: registerName.value });
            window.location.assign("main.html");
        }
    }).catch(function(error) {
        if (error != null) {
            alert(error.message);
        }
    });
}