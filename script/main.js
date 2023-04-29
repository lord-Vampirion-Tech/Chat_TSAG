firebase.initializeApp({
  apiKey: "AIzaSyDqKKY5U3VdJ_FSdznl565NEQ6QJjdCxGo",
  authDomain: "chay-60f5d.firebaseapp.com",
  projectId: "chay-60f5d",
  storageBucket: "chay-60f5d.appspot.com",
  messagingSenderId: "802518043468",
  appId: "1:802518043468:web:86f5a0574a808eb8ff9de9",
  measurementId: "G-G6R8JPLMF8"
});

let userID = "";
let userRef = "";
const storageRef = firebase.storage()

const imgField = $('#img');
const nameField = $('#name');
const searchIdField = $('#searchId');

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    userID = user.uid;
    userRef = firebase.firestore().collection('users').doc(userID);

    userRef.get().then(async (doc) => {
      if (doc.exists) {
        const userData = doc.data();

        if (userData.color != "") imgField.attr('src', userData.imgURL).css("filter", `sepia(100%) hue-rotate(${userData.color}deg)`)
        else imgField.attr('src', userData.imgURL)
        nameField.text(userData.name);
        searchIdField.text(userData.searchId);
      } else {
        console.log("ошибка");
      }
    }).catch((error) => {
      console.error('Ошибка получения данных пользователя:', error);
    });
  }
})

$('#delete').click(async function () {
  try {
    await userRef.delete();
    console.log(`Пользователь с ID ${userID} в firestore удален`);

    await firebase.auth().currentUser.delete();
    console.log(`Пользователь с ID ${userID} в auth удален`);

    const storagePath = 'images/' + userID + '/';
    const folderRef = storageRef.ref().child(storagePath);

    await folderRef.listAll().then(async function (result) {
      await result.items.forEach(async function (fileRef) {
        await fileRef.delete()
        console.log(`фото пользователя с ID ${userID} удалено`);
        window.location.href = "index.html";
      });
    })
  } catch (error) {
    console.error(`Ошибка при удалении пользователя ${userID}: `, error);
  }
})