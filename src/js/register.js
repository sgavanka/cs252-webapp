var registerEmail;
var registerName;
var registerPassword;
var registerConfirmPassword;

window.onload = function() {
    registerEmail = document.getElementById("register-email");
    registerName = document.getElementById("register-name");
    registerPassword = document.getElementById("register-password");
    registerConfirmPassword = document.getElementById("register-confirm-password");
}

register = function() {
    var registerSuccessful = false;
    var errorMessage = "";
    // check if firebase authentication successful
    // if so, set registerSuccessful to true
    // else, set errorMessage to what the error was
    var database = firebase.database().ref();
    var users = database.child('users');
    var user = users.push();
    user.set({
        'email': registerEmail.value,
        'name': registerName.value
    });
    if (registerSuccessful) {
        window.location = "main.html";
    } else {
        // alert(errorMessage);
        alert("this is a temporary alert message because registering isnt supported yet");
    }
}