let arrusers;
let groupName;
let houseID;
let rent;
let water;
let electricity;
let internet;
let cable;
let phone;
//let cellphone;
// all values are by the month
let household = {
    name = groupName,
    arrusers = new Array(),
    houseID = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
    rent = 0,
    water = 0,
    electricity = 0,
    internet = 0,
    cable = 0,
    phone = 0,
    cellphone : 0,

randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
},
addUser(user) {
    arrusers.push(user);
},
addName(name) {
    this.name = name;
},
setRent(rent) {
    this.rent = rent;
},
setWater(water) {
    this.water = water;
},
payRent(paid) {
    if(this.rent - paid >= 0) {
    this.rent = this.rent - paid;
    return "success"
    }
    else
    return "fail"
},
payWater(paid) {
    if(this.water - paid >= 0) {
    this.rent = this.water - paid;
    return "success"
    }
    else
    return "fail"
}
}