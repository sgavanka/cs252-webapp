let groupPaymentsDiv;
let userDiv;
let singleGroupDiv;
let infoAboutPayment = document.createElement("div");
let thisPayment = document.createElement("div");

var addPayment = function(groupKey, createPay) {
    //TODO: fix selection box for fromUser
    //functionality to add a payment to a group
    console.log("button clicked!! functionality to add a payment");
    var fromUserInput = document.createElement("select");
    var toUserInput = document.createElement("select");
    var option1;
    var option2;
    fromUserInput.setAttribute("id", "fromUser");
    toUserInput.setAttribute("id", "toUser");
    databaseRef.child("groups").child(groupKey).child("users").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var user = childSnapshot.val();
            option1 = document.createElement("option");
            option2 = document.createElement("option");
            option1.setAttribute("id", (childSnapshot.key + "option1"));
            option2.setAttribute("id", (childSnapshot.key + "option2"));
            option1.text = user.fullName;
            option2.text = user.fullName;
            fromUserInput.add(option1);
            toUserInput.add(option2);
        });
    });
    var amountInput = document.createElement("input");
    amountInput.setAttribute("id", "amount");
    amountInput.setAttribute("type", "number");
    var submitPaymentButton = document.createElement("button");
    submitPaymentButton.appendChild(document.createTextNode("Add payment"));
    //pushes to the database
    submitPaymentButton.addEventListener("click", function() {
        var fUser = document.getElementById("fromUser").value;
        var tUser = document.getElementById("toUser").value;
        var amt = document.getElementById("amount").value;
        console.log(fUser + " " + tUser + " " + amt);
        var databasePayment = databaseRef.child("groups").child(groupKey).child("payments");
        var payment = {
            fromUser: fUser,
            toUser: tUser,
            amount: amt
        };
        //main payment is stored in the payments node, only amount is stored in the group. 
        //Key of node in payments and the one in group are the same for ease of access
        var lastPushed = paymentsRef.push(payment);
        databasePayment.child(lastPushed.key).set({ amount: amt });
        //User payments div to be used to show a users payments in GUI
        databaseRef.child("users").once("value", function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                if (childSnapshot.val().fullName == fUser) {
                    databaseRef.child("users").child(childSnapshot.key).child("payments").child(lastPushed.key).set({
                        groupKey: groupKey,
                    });
                    var prevTotal = childSnapshot.val().totalOutgoing;
                    var newTotal = +prevTotal + +amt;
                    console.log("new total is: " + newTotal);
                    childSnapshot.getRef().update({ totalOutgoing: newTotal });
                    childSnapshot.getRef().child("groups").child(groupKey).once("value", function(childChildSnapshot) {
                        childChildSnapshot.getRef().update({
                            totalOutgoing: newTotal
                        });
                    });
                } else if (childSnapshot.val().fullName == tUser) {
                    databaseRef.child("users").child(childSnapshot.key).child("payments").child(lastPushed.key).set({
                        groupKey: groupKey,
                    });
                    var prevTotal = childSnapshot.val().totalIncoming;
                    var newTotal = +prevTotal + +amt;
                    console.log("new total is: " + newTotal);
                    childSnapshot.getRef().update({ totalIncoming: newTotal });
                    childSnapshot.getRef().child("groups").child(groupKey).once("value", function(childChildSnapshot) {
                        childChildSnapshot.getRef().update({
                            totalIncoming: newTotal
                        });
                    });
                }
            });
        });
        thisPayment.removeChild(fromUserInput);
        thisPayment.removeChild(toUserInput);
        thisPayment.removeChild(amountInput);
        thisPayment.removeChild(submitPaymentButton);
        createPay.removeChild(thisPayment);
        console.log("removed child");
        paymentButton.removeAttribute('disabled');
    });
    thisPayment.appendChild(fromUserInput);
    thisPayment.appendChild(toUserInput);
    thisPayment.appendChild(amountInput);
    thisPayment.appendChild(submitPaymentButton);
    createPay.appendChild(thisPayment);
};
var displayPayments = function(groupKey) {
    console.log("button created");
    var lineBreak = document.createElement("br");
    groupPaymentsDiv = document.createElement("ul");
    userPaymentsByGroupDiv = document.createElement("ul");
    userPaymentsByGroupDiv.setAttribute("id", user.databaseRef.key);
    //userPaymentsByGroupDiv.style.visibility = "hidden";
    // groupWrapper.appendChild(lineBreak);
    //Iterates through the database when a child is added and displays list of payments
    databaseRef.child("groups").child(groupKey).child("payments").on("child_added", function(snapshot) {
        var currKey = snapshot.key;
        paymentsRef.child(currKey).once("value", function(childSnapshot) {
            var payment = childSnapshot.val();
            var paymentDiv = document.createElement("li");
            paymentDiv.setAttribute("id", childSnapshot.key);
            paymentDiv.appendChild(document.createTextNode(payment.fromUser + " owes " + payment.toUser + ": $" + payment.amount));
            let paymentDivButton = document.createElement("button");
            paymentDivButton.appendChild(document.createTextNode("Payment recieved"));
            paymentDivButton.addEventListener("click", function() {
                user.databaseRef.once("value", function(childChildSnapshot) {
                    if (childChildSnapshot.val().fullName == childSnapshot.val().toUser) {
                        deletePayment(groupKey, childSnapshot.key);
                    }
                });
            });
            paymentDiv.appendChild(paymentDivButton);
            groupPaymentsDiv.appendChild(paymentDiv);
        });
    });
    databaseRef.child("groups").child(groupKey).child("payments").on("child_removed", function(snapshot) {
        groupPaymentsDiv.removeChild(document.getElementById(snapshot.key));
    });

    // groupWrapper.appendChild(groupPaymentsDiv);
    //paymentsByUserDiv
    var currUserKey = user.databaseRef.key;
    databaseRef.child("users").child(currUserKey).child("payments").on("child_added", function(snapshot) {
        paymentsRef.child(snapshot.key).once("value", function(childSnapshot) {
            var payment = childSnapshot.val();
            if (user.fullName == payment.fromUser) {
                infoAboutPayment.appendChild(document.createTextNode("You owe " + payment.toUser + " $" + payment.amount));
            } else if (user.fullName == payment.toUser) {
                infoAboutPayment.appendChild(document.createTextNode(payment.fromUser + " owes you " + " $" + payment.amount));
            }
            if (document.getElementById(snapshot.val().groupKey + user.databaseRef.key)) {
                //append to this existing div
                singleGroupDiv = document.getElementById(snapshot.val().groupKey + user.databaseRef.key);
                singleGroupDiv.appendChild(infoAboutPayment);
            } else {
                singleGroupDiv = document.createElement("li");
                singleGroupDiv.setAttribute("id", (snapshot.val().groupKey + user.databaseRef.key));
                databaseRef.child("groups").child(snapshot.val().groupKey).on("value", function(snapshot) {
                    var groupName = document.createTextNode("Group name: " + snapshot.val().groupName);
                    singleGroupDiv.appendChild(groupName);
                });
                singleGroupDiv.appendChild(infoAboutPayment);
                singleGroupDiv.appendChild(document.createElement("br"));
                userPaymentsByGroupDiv.appendChild(singleGroupDiv);
            }
        });
    });
    // groupWrapper.appendChild(document.createElement("br"));
    // paymentsWrapper.appendChild(userPaymentsByGroupDiv);
    return groupPaymentsDiv;
};
//functionality to delete edit from database, will remove from list as well as the main payment node(will work once UI button is implemented)
var deletePayment = function(groupKey, paymentId) {
    paymentsRef.child(paymentId).once("value", function(snapshot2) {
        let amt = snapshot2.val().amount;
        let fUser = snapshot2.val().fromUser;
        let tUser = snapshot2.val().toUser;
        databaseRef.child("users").once("value", function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                if (childSnapshot.val().fullName == fUser) {
                    databaseRef.child("users").child(childSnapshot.key).child("payments").child(paymentId).remove();
                    var prevTotal = childSnapshot.val().totalOutgoing;
                    var newTotal = +prevTotal - +amt;
                    childSnapshot.getRef().update({ totalOutgoing: newTotal });
                    childSnapshot.getRef().child("groups").child(groupKey).once("value", function(childChildSnapshot) {
                        childChildSnapshot.getRef().update({ totalOutgoing: newTotal });
                    });
                } else if (childSnapshot.val().fullName == tUser) {
                    databaseRef.child("users").child(childSnapshot.key).child("payments").child(paymentId).remove();
                    var prevTotal = childSnapshot.val().totalIncoming;
                    var newTotal = +prevTotal - +amt;
                    childSnapshot.getRef().update({ totalIncoming: newTotal });
                    childSnapshot.getRef().child("groups").child(groupKey).once("value", function(childChildSnapshot) {
                        childChildSnapshot.getRef().update({ totalIncoming: newTotal });
                    });
                }
            });
        });
    }).then(function() {
        paymentsRef.child(paymentId).remove();
        databaseRef.child("groups").child(groupKey).child("payments").child(paymentId).remove();
    });
};