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

    myGroupsRef.on("child_added", function(snapshot) {
        alert("group added");
    });

    myGroupsRef.on("child_changed", function(snapshot) {
        alert("group changed");
    });
}

//adds the user specified by userToAddToGroupInput to the usersToAddToGroupList
addUserToGroup = function() {
    // TODO validate that it's a valid user, then get their full name from the database.
    // createTextNode(fullName) instead of userToAddToGroupInput.value. Also check that the user isn't in the list already
    usersRef.orderByChild('email').equalTo(userToAddToGroupInput.value).once('value', function(snapshot) {
        if (!document.getElementById(Object.keys(snapshot.val())[0])) {
            if (user.firebaseUser.uid != Object.keys(snapshot.val())[0]) {
                usersRef.child(Object.keys(snapshot.val())[0]).once('value', function(childSnapshot) {
                    let userToAdd = document.createElement("li");
                    userToAdd.id = Object.keys(snapshot.val())[0];
                    userToAdd.appendChild(document.createTextNode(childSnapshot.val().fullName));
                    usersToAddToGroupList.appendChild(userToAdd);
                    userToAddToGroupInput.value = "";
                });
            } else {
                alert("You cannot add yourself to the group.");
            }
        } else {
            alert("You have already added this person to the group.");
        }
    });
}

// hides the group details wrapper and resets any values within it.
cancelCreateGroup = function() {
    groupDetailsWrapper.classList.add("hidden");
    groupNameInput.value = "";
    userToAddToGroupInput.value = "";
    while (usersToAddToGroupList.firstChild) {
        usersToAddToGroupList.removeChild(usersToAddToGroupList.firstChild);
    }
}

// Shows the group details wrapper
createGroup = function() {
    groupDetailsWrapper.classList.remove("hidden");
}

// Called when user clicks the logout button in main.js. Logs the user out and brings them to index.html
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
            user.databaseRef.child("groups").child(group.key).set({ groupName: groupNameInput.value });
            group.child('users').child(user.firebaseUser.uid).set({ fullName: user.fullName });
            for (var i = 0; i < usersToAddToGroupList.childNodes.length; i++) {
                group.child('users').child(usersToAddToGroupList.childNodes[i].id).set({ fullName: usersToAddToGroupList.childNodes[i].value });
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