import firebaseConfig from "./config.js";

const user = JSON.parse(localStorage.getItem('userID'));
console.log(user);
const userRef = firebase.firestore().collection("users").doc(user);
const storageRef = firebase.storage()

const imgField = $('#img');
const nameField = $('#name');
const searchIdField = $('#searchId');

firebase.auth().onAuthStateChanged((user) => {

  if (user) {
    const userID = user.uid;
    const userRef = firebase.firestore().collection('users').doc(userID);

    userRef.get().then(async (doc) => {
      if (doc.exists) {
        const userData = doc.data(); 
        imgField.attr('src', userData.imgURL).css("filter", `sepia(100%) hue-rotate(${userData.color}deg)`)
        
        nameField.text(userData.name);
        searchIdField.text(userData.searchId);
      } else {
        console.log("ошибка");
      }
    }).catch((error) => {
      console.error('Ошибка получения данных пользователя:', error);
    });
  } else {
    console.log('Пользователь не авторизован');
  }
});

$('#delete').click(async function () {
  try {
    await userRef.delete();
    console.log(`Пользователь с ID ${user} в firestore удален`);

    await firebase.auth().currentUser.delete();
    console.log(`Пользователь с ID ${user} в auth удален`);

    const storagePath = 'images/' + user + '/';
    const folderRef = storageRef.ref().child(storagePath);

    await folderRef.listAll().then(async function (result) {
      await result.items.forEach(async function (fileRef) {
        await fileRef.delete()
        console.log(`фото пользователя с ID ${user} удалено`);
      });
    })

    // await folderRef.delete()

    alert(`Пользователь с ID ${user} удален`);
    window.location.href = "index.html";
  } catch (error) {
    console.error(`Ошибка при удалении пользователя ${user}: `, error);
  }
});
