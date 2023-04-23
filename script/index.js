import firebaseConfig from "./config.js";

const auth = firebase.auth();
const db = firebase.firestore();
const usersCollection = db.collection("users");
const storageRef = firebase.storage()

const emailRegex = /\S+@\S+\.\S+/;
const alert = $(`.alert`)
const alert_text = $(`#alert  #text`)
const img = $(`#img`)
let imgURL = ""
let file = ""
var color = "" 
$(`#register-form`).submit(function (event) {
  event.preventDefault();

  const email = $(`#email-1`).val();
  const name = $(`#name`).val();
  const password = $(`#password-1`).val();

  if (email === '' || name === '' || password === '') {
    alert_text.text('Пожалуйста, заполните все поля')
    alert.toggleClass("close")
    return;
  }
  if (!emailRegex.test(email)) {
    alert_text.text('введите коректную почту')
    alert.toggleClass("close")
    return;
  }
  if (email.length < 10) {
    alert_text.text('почта слишком короткая')
    alert.toggleClass("close")
    return;
  }
  if (password.length < 6) {
    alert_text.text('пароль слишком короткий. не меншье 6 символов')
    alert.toggleClass("close")
    return;
  }
  auth.fetchSignInMethodsForEmail(email)
    .then((signInMethods) => {
      if (signInMethods.length > 0) {
        alert_text.text(`Аккаунт ${email} уже существует`)
        alert.toggleClass("close")
      } else {
        auth.createUserWithEmailAndPassword(email, password).then(async (userCredential) => {
          const userId = userCredential.user.uid;
          const userDoc = usersCollection.doc(userId);

          if (await $('#fileInput')[0].files.length != 0) {
            const storagePath = 'images/' + userId + '/' + file.name;
            const fileRef = storageRef.ref().child(storagePath);

            await fileRef.put(file).then(async function (snapshot) {
              await snapshot.ref.getDownloadURL().then(async function (url) {
                imgURL = await url;
                color = ""
                console.log("все ок");
              });
            });
          } else {
            imgURL = "https://firebasestorage.googleapis.com/v0/b/chay-60f5d.appspot.com/o/ase.png?alt=media&token=0b5d3f57-3d6b-46d5-8546-15d6c48635c9"
            color = Math.floor(Math.random() * (361))
            console.log("все ок");
          }
          console.log(userId);
          await userDoc.set({
            email: email,
            name: name,
            password: password,
            imgURL: imgURL,
            color: color,
            searchId: "@baseuser",
          })
          localStorage.setItem('userID', JSON.stringify(userId));
          window.location.href = "main.html";
        }).catch((error) => {
          console.error('Не удалось создать пользователя: ' + error.message);
        })
      }
    }).catch((error) => {
      console.error('Произошла ошибка: ' + error.message);
    });
});

$('#fileButton').click(function () {
  $('#fileInput').click();
});

$('#fileInput').on('change', function () {
  file = this.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      if (this.width > 0 && this.height > 0) {
        $('#img').attr('src', e.target.result);
      } else {
        alert_text.text('Выбранный файл не является изображением')
        alert.toggleClass("close")
      }
    };
    img.onerror = function () {
      alert_text.text('Выбранный файл не является изображением')
      alert.toggleClass("close")
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

$('#login-form').submit(function (event) {
  event.preventDefault();

  const email = $('#email-2').val();
  const password = $('#password-2').val();

  auth.signInWithEmailAndPassword(email, password).then(() => {
    localStorage.setItem('userID', JSON.stringify(auth.currentUser.uid));
    window.location.href = "main.html";
  }).catch((error) => {
    alert_text.text('пользователя с такими данными несуществует')
    alert.toggleClass("close")
    console.error("Ошибка входа:", error);
  });
}); 
