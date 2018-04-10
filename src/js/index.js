writeToDatabase = function() {
    var fileList = firebase.database().ref().child('users');
    var newFile = fileList.push(); // generate a new fileID
    newFile.set({
        'fileName': "hello",
        'fileContents': 'word'
    });
}