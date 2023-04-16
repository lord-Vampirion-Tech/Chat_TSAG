import firebaseConfig from "./config.js";

const auth = firebase.auth();
const db = firebase.firestore();
const usersCollection = db.collection("users");

$(`#register-form`).submit(function (event) {
  event.preventDefault();

  const email = $(`#email-1`).val();
  const name = $(`#name`).val();
  const password = $(`#password-1`).val();

  if (email === '' || name === '' || password === '') {
    alert('Пожалуйста, заполните все поля');
    return;
  }

  auth.fetchSignInMethodsForEmail(email)
    .then((signInMethods) => {
      if (signInMethods.length > 0) {
        console.error(`Аккаунт ${email} уже существует`);
        alert(`Аккаунт ${email} уже существует`);
      } else {
        auth.createUserWithEmailAndPassword(email, password).then(async (userCredential) => {
          const userId = userCredential.user.uid;
          const userDoc = usersCollection.doc(userId);
          console.log(userDoc);
          alert('Аккаунт создан');
          await userDoc.set({
            email: email,
            name: name,
            password: password,
            searchId: "@baseuser",
            date: getCurrentDateTime(),
            last_date_login: getCurrentDateTime()
          })
          localStorage.setItem('userID', JSON.stringify(userId));
          window.location.href = "Main.html";
        }).catch((error) => {
          console.error('Не удалось создать пользователя: ' + error.message);
        })
      }
    }).catch((error) => {
      console.error('Произошла ошибка: ' + error.message);
    });
});

$('#login-form').submit(function (event) {
  event.preventDefault();

  const email = $('#email-2').val();
  const password = $('#password-2').val();

  auth.signInWithEmailAndPassword(email, password).then(() => {
    const userId = auth.currentUser.uid;
    const userRef = db.collection('users').doc(userId);

    // Обновляем параметр "last_date_login" в Firestore Database
    userRef.update({
      last_date_login: getCurrentDateTime()
    }).then(() => {
      alert("Вход выполнен успешно");
      localStorage.setItem('userID', JSON.stringify(userId));
      window.location.href = "Main.html";
    }).catch((error) => {
      console.error("Ошибка при обновлении параметра last_date_login:", error);
    })


  }).catch((error) => {
    alert("пользователя с такими данными несуществует");
    console.error("Ошибка входа:", error);
  });
});

function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Форматирование даты и времени
  const formattedDate = `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;
  const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return `${formattedDate}_${formattedTime}`;
}

// const date1 = '16.04.2024_16:28:01';
// const date2 = getCurrentDateTime();

// if (date1 < date2) {
//   console.log('date1 меньше, чем date2');
// } else if (date1 > date2) {
//   console.log('date1 больше, чем date2');
// } else {
//   console.log('date1 равно date2');
// }

// console.log(getCurrentDateTime());