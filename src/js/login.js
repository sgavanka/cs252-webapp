var loginEmail;
var loginPassword;

window.onload = function() {
    loginEmail = document.getElementById("login-email");
    loginPassword = document.getElementById("login-password");
}

login = function() {
    var loginSuccessful = false;
    var errorMessage = "";
    // check if firebase authentication successful
    // if so, set loginSuccessful to true
    // else, set errorMessage to what the error was
    if (loginSuccessful) {
        window.location = "main.html";
    } else {
        // alert(errorMessage);
        alert("this is a temporary alert message because logging in isnt supported yet");
    }
}