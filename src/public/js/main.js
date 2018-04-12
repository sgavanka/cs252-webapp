let addUserToGroupButton;
let cancelCreateGroupButton;
let createGroupButton;
let groupDetailsWrapper;
let groupNameInput;
let logoutButton;
let submitGroupButton;
let usersToAddToGroupList;
let userToAddToGroupInput;

window.onload = function() {
    addUserToGroupButton = document.getElementById("add-user-to-group-button");
    addUserToGroupButton.addEventListener("click", function() {
        addUserToGroup();
    });
    cancelCreateGroupButton = document.getElementById("cancel-create-group-button");
    cancelCreateGroupButton.addEventListener("click", function() {
        cancelCreateGroup();
    });
    createGroupButton = document.getElementById("create-group-button");
    createGroupButton.addEventListener("click", function() {
        createGroup();
    });
    groupNameInput = document.getElementById("group-name-input");
    logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", function() {
        logout();
    });
    submitGroupButton = document.getElementById("submit-group-button");
    submitGroupButton.addEventListener("click", function() {
        submitGroup();
    });
    usersToAddToGroupList = document.getElementById("users-to-add-to-group-list");
    userToAddToGroupInput = document.getElementById("user-to-add-to-group-input");
    groupDetailsWrapper = document.getElementById("group-details-wrapper");

    // When the user is added to a group
    myGroupsRef.on("child_added", function(snapshot) {
        alert("group added");
    });

    // When something in an existing group changes
    myGroupsRef.on("child_changed", function(snapshot) {
        alert("group changed");
    });
}

// Checks for user with the specified email in the database.
// If the user exists, add that user's full name to the usersToAddToGroup list.
addUserToGroup = function() {
    usersRef.orderByChild('email').equalTo(userToAddToGroupInput.value).once('value', function(snapshot) {
        if (snapshot.val()) {
            if (!document.getElementById(Object.keys(snapshot.val())[0])) {
                if (user.firebaseUser.uid != Object.keys(snapshot.val())[0]) {
                    usersRef.child(Object.keys(snapshot.val())[0]).once('value', function(childSnapshot) {
                        let userToAdd = document.createElement("li");
                        userToAdd.id = Object.keys(snapshot.val())[0];
                        userToAdd.appendChild(document.createTextNode(childSnapshot.val().fullName));
                        let deleteButton = document.createElement("BUTTON");
                        let deleteButtonText = document.createTextNode("x");
                        deleteButton.appendChild(deleteButtonText);
                        deleteButton.addEventListener("click", function() {
                            usersToAddToGroupList.removeChild(userToAdd);
                        });
                        userToAdd.appendChild(deleteButton);
                        usersToAddToGroupList.appendChild(userToAdd);
                        userToAddToGroupInput.value = "";
                    });
                } else {
                    alert("You cannot add yourself to the group.");
                }
            } else {
                alert("You have already added this person to the group.");
            }
        } else {
            alert("The specified user does not exist.");
        }
    });
}

// Hides the group details wrapper and resets any values within it.
cancelCreateGroup = function() {
    groupDetailsWrapper.classList.add("hidden");
    groupNameInput.value = "";
    userToAddToGroupInput.value = "";

    // Remove all items from the usersToAddToGroup list
    while (usersToAddToGroupList.firstChild) {
        usersToAddToGroupList.removeChild(usersToAddToGroupList.firstChild);
    }
}

// Shows the group details wrapper
createGroup = function() {
    groupDetailsWrapper.classList.remove("hidden");
}

// Called when the user clicks the logout button. Logs the user out and brings them to index.html
// The function firebase.auth().onAuthStateChanged in global.js is automatically called when the user's state changes.
logout = function() {
    firebase.auth().signOut().then(function() {
        window.location.assign("index.html");
    }).catch(function(error) {
        alert(error);
        window.location.assign("index.html");
    });
}

// Pushes the newly created group to the database
submitGroup = function() {
    if (usersToAddToGroupList.childNodes.length > 0) {
        if (groupNameInput.value != "") {
            let group = groupsRef.push();
            group.set({ groupName: groupNameInput.value });

            // Add this user to the newly created group.
            user.databaseRef.child("groups").child(group.key).set({ groupName: groupNameInput.value });
            group.child('users').child(user.firebaseUser.uid).set({ fullName: user.fullName });

            for (var i = 0; i < usersToAddToGroupList.childNodes.length; i++) {
                // Add the ith user in the list of users to add to the group.
                group.child('users').child(usersToAddToGroupList.childNodes[i].id).set({ fullName: document.getElementById(usersToAddToGroupList.childNodes[i].id).value });
                usersRef.child(usersToAddToGroupList.childNodes[i].id).child("groups").child(group.key).set({ groupName: groupNameInput.value });
            }
            groupDetailsWrapper.classList.add("hidden");
        } else {
            alert("Group Name cannot be empty");
        }
    } else {
        alert("You must add at least one member to the group.");
    }
}