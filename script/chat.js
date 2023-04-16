import firebaseConfig from "./config.js";

const user = JSON.parse(localStorage.getItem('userID'));

const dataField = $('.data');
const emailField = $('.email'); 
const nameField = $('.name');
const passwordField = $('.password');
const searchIdField = $('.searchId');

console.log(user);

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // Пользователь авторизован, получаем доступ к его данным
    const userID = user.uid;
    const userRef = firebase.firestore().collection('users').doc(userID);



    userRef.get().then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        dataField.text(userData.date);
        emailField.text(userData.email); 
        nameField.text(userData.name);
        passwordField.text(userData.password);
        searchIdField.text(userData.searchId);
      } else {
        console.log("ошибка");
      }
    }).catch((error) => {
      console.error('Ошибка получения данных пользователя:', error);
    });
  } else {
    // Пользователь не авторизован
    console.log('Пользователь не авторизован');
  }
});

$('#delete').click(async function () {
  try {
    const userRef = firebase.firestore().collection("users").doc(user);
    await userRef.delete();
    console.log(`Пользователь с ID ${user} в firestore удален`); 

    await firebase.auth().currentUser.delete();
    console.log(`Пользователь с ID ${user} в auth удален`); 
    alert(`Пользователь с ID ${user} удален`); 
    window.location.href = "index.html";
  } catch (error) {
    console.error(`Ошибка при удалении пользователя ${user}: `, error);
  }
});