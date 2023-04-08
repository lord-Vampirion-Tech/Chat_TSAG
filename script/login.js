import firebaseConfig from "./fbConfig.js";

// Получение ссылки на модуль Firebase Authentication
const auth = firebase.auth();
const db = firebase.firestore();
const usersCollection = db.collection("users");

$('#register-form').submit(function (event) {
  event.preventDefault(); // Отменяем стандартное поведение формы

  const email = $('#email-input').val();
  const name = $('#username-input').val()
  const password = $('#password-input').val();

  // Создаем нового пользователя с помощью модуля Firebase Authentication
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const userId = userCredential.user.uid;
      const userDoc = usersCollection.doc(userId);
      userDoc.set({
        email: email,
        name: name,
        password: password,
        searchId: "@baseuser",
        ID: userId
      }).then(() => {
        console.log(`Данные пользователя ${userId} успешно сохранены в Firestore`); 
        // перенаправление на следующую страницу
        window.location.href = "Chat.html";
      }).catch((error) => {
        console.error(`Ошибка сохранения данных пользователя ${userId} в Firestore:`, error);
      });
    })
    .catch((error) => {
      console.error("Ошибка регистрации:", error);
    });
});