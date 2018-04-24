let groupPaymentsDiv;
let userDiv;
let singleGroupDiv;
let infoAboutPayment = document.createElement("div");
let thisPayment = document.createElement("div");

var addPayment = function(groupKey, createPay, groupWrapper) {
    //TODO: fix selection box for fromUser
    //functionality to add a payment to a group
    var payHead = document.createElement("div");
    console.log("button clicked!! functionality to add a payment");
    var fromUserInput = document.createElement("select");
    var fromTxt = document.createElement("span");
    fromTxt.appendChild(document.createTextNode("From \u2192 "));
    var fromUser = document.createElement("div");
    fromTxt.classList.add("payS");
    fromUser.appendChild(fromTxt);
    fromUser.appendChild(fromUserInput);
    var toUserInput = document.createElement("select");
    var toTxt = document.createElement("span");
    toTxt.appendChild(document.createTextNode("To   \u2192      "))
    var toUser = document.createElement("div");
    toTxt.classList.add("payT");
    toUser.appendChild(toTxt);
    toUser.appendChild(toUserInput);
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
    var amountSpan = document.createElement("span");
    amountSpan.appendChild(document.createTextNode("Amount \u2192"));
    var aInput = document.createElement("div");
    aInput.appendChild(amountSpan);
    aInput.appendChild(amountInput);
    var descriptionInput = document.createElement("input");
    amountInput.setAttribute("id", "amount");
    amountInput.setAttribute("type", "number");
    amountInput.setAttribute("min", 0);
    amountInput.setAttribute("placeholder", "Payment Amount");
    descriptionInput.setAttribute("id", "description");
    descriptionInput.setAttribute("placeholder", "Payment Description");
    var submitPaymentButton = document.createElement("button");
    submitPaymentButton.appendChild(document.createTextNode("Add payment"));
    submitPaymentButton.classList.add("fixer");

    let cancelButton = document.createElement("button");
    cancelButton.appendChild(document.createTextNode("Cancel"));
    cancelButton.addEventListener("click", function() {
        thisPayment.removeChild(fromUserInput);
        thisPayment.removeChild(toUserInput);
        thisPayment.removeChild(amountInput);
        thisPayment.removeChild(descriptionInput);
        thisPayment.removeChild(submitPaymentButton);
        thisPayment.removeChild(cancelButton);
        paymentButton.removeAttribute('disabled');
    });

    //pushes to the database
    submitPaymentButton.addEventListener("click", function() {
        var fUser = document.getElementById("fromUser").value;
        var tUser = document.getElementById("toUser").value;
        var amt = document.getElementById("amount").value;
        if (fUser == tUser) {
            alert("You can't send money from and to the same person!");
            return;
        }
        if ((amt == "") || (amt < 0)) {
            alert("Payment amount cannot be blank/negative");
            return;
        }
        var description = document.getElementById("description").value;
        console.log(fUser + " " + tUser + " " + amt);
        var databasePayment = databaseRef.child("groups").child(groupKey).child("payments");
        var payment = {
            fromUser: fUser,
            toUser: tUser,
            amount: amt,
            description: description
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
                        let newTot = +childChildSnapshot.val().totalOutgoing + +amt;
                        childChildSnapshot.getRef().update({
                            totalOutgoing: newTot
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
                        let newTot = +childChildSnapshot.val().totalIncoming + +amt;
                        childChildSnapshot.getRef().update({
                            totalIncoming: newTot
                        });
                    });
                }
            });
        });
        thisPayment.removeChild(payHead);
        // thisPayment.removeChild(fromUserInput);
        thisPayment.removeChild(fromUser);
        thisPayment.removeChild(toUsert);
        thisPayment.removeChild(aInput);
        thisPayment.removeChild(descriptionInput);
        thisPayment.removeChild(submitPaymentButton);
        groupWrapper.removeChild(thisPayment);
        console.log("removed child");
        paymentButton.removeAttribute('disabled');
    });
    thisPayment.appendChild(payHead);
    payHead.appendChild(document.createTextNode("Create Payment"));
    // thisPayment.appendChild(fromUserInput);
    thisPayment.appendChild(fromUser);
    thisPayment.appendChild(toUser);
    thisPayment.appendChild(aInput);
    thisPayment.appendChild(descriptionInput);
    thisPayment.appendChild(submitPaymentButton);
    thisPayment.classList.add("paySelect");
    submitPaymentButton.classList.add("fixer");
    payHead.classList.add("payHead");
    toTxt.classList.add("payT");
    fromTxt.classList.add("payS");
    groupWrapper.appendChild(thisPayment);
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
            var paymentDiv = document.createElement("li")
            var preElement = document.createElement("pre");
            if (payment.description != "") {
                let bold = document.createElement("b");
                bold.appendChild(document.createTextNode(payment.description));
                preElement.appendChild(bold);
                preElement.appendChild(document.createElement("br"));
            }
            preElement.appendChild(document.createTextNode(payment.fromUser + " owes " + payment.toUser + ": $" + payment.amount));
            paymentDiv.setAttribute("id", childSnapshot.key);
            paymentDiv.classList.add("divvy");
            paymentDiv.appendChild(preElement);
            let paymentDivButton = document.createElement("button");
            paymentDivButton.classList.add("conf-button");
            paymentDivButton.appendChild(document.createTextNode("Payment recieved"));
            paymentDivButton.addEventListener("click", function() {
                user.databaseRef.once("value", function(childChildSnapshot) {
                    if (childChildSnapshot.val().fullName == childSnapshot.val().toUser) {
                        deletePayment(groupKey, childSnapshot.key);
                    }
                });
            });
            user.databaseRef.once("value", function(childChildSnapshot) {
                if (childChildSnapshot.val().fullName == childSnapshot.val().toUser) {
                    paymentDiv.appendChild(paymentDivButton);
                }
            });
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
                        let newTot = +childChildSnapshot.val().totalOutgoing - +amt;
                        childChildSnapshot.getRef().update({ totalOutgoing: newTot });
                    });
                } else if (childSnapshot.val().fullName == tUser) {
                    databaseRef.child("users").child(childSnapshot.key).child("payments").child(paymentId).remove();
                    var prevTotal = childSnapshot.val().totalIncoming;
                    var newTotal = +prevTotal - +amt;
                    childSnapshot.getRef().update({ totalIncoming: newTotal });
                    childSnapshot.getRef().child("groups").child(groupKey).once("value", function(childChildSnapshot) {
                        let newTot = +childChildSnapshot.val().totalIncoming - +amt;
                        childChildSnapshot.getRef().update({ totalIncoming: newTot });
                    });
                }
            });
        });
    }).then(function() {
        paymentsRef.child(paymentId).remove();
        databaseRef.child("groups").child(groupKey).child("payments").child(paymentId).remove();
    });
};