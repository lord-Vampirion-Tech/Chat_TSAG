import firebaseConfig from "./fbConfig.js";
 
const auth = firebase.auth();

let username = "";
const messagesRef = firebase.database().ref('messages');

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // Пользователь авторизован
    const uid = user.uid;
    const usersCollection = firebase.firestore().collection("users");
    const userDoc = usersCollection.doc(uid);
    userDoc.get().then((doc) => {
      if (doc.exists) {
        // Данные пользователя найдены, выводим на страницу
        const data = doc.data();
        console.log(data.name);
        console.log(data.email);
        username = data.name;
        // Показываем защищенный контент
      } else {
        // Данные пользователя не найдены
        console.error("Данные пользователя не найдены");
        // Перенаправляем на страницу авторизации
        window.location.href = "index.html";
      }
    }).catch((error) => {
      console.error("Ошибка получения данных пользователя:", error);
    });
  } else {
    // Пользователь не авторизован
    console.error("Пользователь не авторизован");
    // Перенаправляем на страницу авторизации
    window.location.href = "index.html";
  }
});

const logoutButton = $('#logout-button');
logoutButton.on('click', function() {
  auth.signOut().then(() => {
    // Перенаправляем пользователя на страницу с регистрацией
    window.location.href = 'index.html';
  }).catch((error) => {
    console.error('Ошибка выхода из аккаунта:', error);
  });
});


// обработчик отправки сообщения
$('#message-form').submit(function (event) {
  event.preventDefault();
  var message = $('#message-input').val();
  messagesRef.push({
    username: username,
    message: message,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });
  $('#message-input').val('');
});

// обработчик изменения в Realtime Database
messagesRef.on('child_added', function (snapshot) {
  var message = snapshot.val().message;
  var senderName = snapshot.val().username;
  var timestamp = new Date(snapshot.val().timestamp);
  var minutes = "0" + timestamp.getMinutes();
  var seconds = "0" + timestamp.getSeconds();
  var time = minutes.substr(-2) + ':' + seconds.substr(-2);
  if (senderName === username) {
    $('#messages').append('<p>(' + time + ')<strong>Вы</strong>: ' + message + '</p>');
  } else {
    $('#messages').append('<p>(' + time + ')<strong>' + senderName + '</strong>: ' + message + '</p>');
  }
});