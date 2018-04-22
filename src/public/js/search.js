// let searchButton;
// let searchInput;

// window.onload = function() {
//     let searchButton = document.getElementById("search-button");
//     let searchInput = document.getElementById("search-input");
//     searchButton.addEventListener("click", function() {
//         searchForGroup();
//     });
// }

// var searchForGroup = function() {
//         user.firebaseUser.child("groups").orderByChild("groupName").equalTo(searchInput.value).once('value', function(snapshot) {
//         if (snapshot.val()) {
//             console.log(snapshot.val.groupName);
//         }
//     });
// }