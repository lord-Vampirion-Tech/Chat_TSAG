firebase.initializeApp({
  apiKey: "AIzaSyDqKKY5U3VdJ_FSdznl565NEQ6QJjdCxGo",
  authDomain: "chay-60f5d.firebaseapp.com",
  projectId: "chay-60f5d",
  storageBucket: "chay-60f5d.appspot.com",
  messagingSenderId: "802518043468",
  appId: "1:802518043468:web:86f5a0574a808eb8ff9de9",
  measurementId: "G-G6R8JPLMF8"
});

const input = $('#fileInput');
const emailRegex = /\S+@\S+\.\S+/;
const MBLimit =1024*1024;
let file = ""

const auth = firebase.auth();
const db = firebase.firestore();
const storageRef = firebase.storage()
const usersCollection = db.collection("users");

input.on('change', function () {
  if (!input.prop('files') && !input.prop('files')[0]) returnz
  const file = this.files[0];
  if (file.size > MBLimit) {
    alert('Размер изображения должен быть не более 1 МБ');
    input.value = '';
    return
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.src = e.target.result;

    img.onload = function () {
      if (this.width > 0 && this.height > 0) {
        $('.img').find('img').attr('src', img.src);
      } else {
        console.error('Выбранный файл не является изображением')
      }
    };
    img.onerror = function () {
      console.error('Выбранный файл не является изображением')
    };
  };
  reader.readAsDataURL(file);
});

$(`#register-form`).submit(function (event) {
  event.preventDefault();

  const email = $(`#email-1`).val();
  const name = $(`#name`).val();
  const password = $(`#password-1`).val();

  if (email === '' || name === '' || password === '') {
    console.error('Пожалуйста, заполните все поля')
    return;
  } else if (!emailRegex.test(email)) {
    console.error('введите коректную почту')
    return;
  } else if (email.length < 10) {
    console.error('почта слишком короткая')
    return;
  } else if (password.length < 6) {
    console.error('пароль слишком короткий. не меншье 6 символов')
    return;
  } else if (name.length < 3) {
    console.error('имя слишком короткое. не меншье 6 символов')
    return;
  }

  auth.fetchSignInMethodsForEmail(email).then((signInMethods) => {
    if (signInMethods.length > 0) {
      console.error((`Аккаунт ${email} уже существует`));
      return
    }

    auth.createUserWithEmailAndPassword(email, password).then(async (userCredential) => {
      const userId = userCredential.user.uid;
      const userDoc = usersCollection.doc(userId);
      let imgURL = "";
      let color = "";

      localStorage.setItem('userID', JSON.stringify(userId));

      if (await input[0].files.length != 0) {
        const file = input[0].files[0];
        const storagePath = 'images/' + userId + '/avatar.png';
        const fileRef = storageRef.ref().child(storagePath);

        await fileRef.put(file).then(async function (snapshot) {
          await snapshot.ref.getDownloadURL().then(function (url) {
            imgURL = url;
            console.log("загружено фото пользователя по ссылке " + imgURL);
          }).catch((error) => {
            console.error('Произошла ошибка: ' + error.message);
          });
        }).catch((error) => {
          console.error('Произошла ошибка: ' + error.message);
        });
      } else {
        imgURL = "https://github.com/lord-Vampirion-Tech/Chat_TSAG/blob/main/ase.png?raw=true"
        color = Math.floor(Math.random() * (361))
        console.log("применено стандартное фото");
      }
      console.log("готово")

      await userDoc.set({
        email: email,
        name: name,
        password: password,
        imgURL: imgURL,
        color: color,
        searchId: "@" + name + "_",
      })
      window.location.href = "main.html";

    }).catch((error) => {
      console.error('Произошла ошибка: ' + error.message);
    });
  }).catch((error) => {
    console.error('Произошла ошибка: ' + error.message);
  });
})

$('#login-form').submit(function (event) {
  event.preventDefault();

  const email = $('#email-2').val();
  const password = $('#password-2').val();

  auth.signInWithEmailAndPassword(email, password).then(() => {
    window.location.href = "Main.html";
  }).catch((error) => {
    console.error("пользователя с такими данными несуществует ", error);
  });
}); 