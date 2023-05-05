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
const db = firebase.firestore();
const usersCollection = db.collection("users");

const input = $('#fileInput');
const MBLimit = 1024 * 1024; 
const imgField = $('#img');
const nameField = $('#name');
const passwordField = $('#password');
const emailField = $('#email');
const descripdField = $('#descrip');

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

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    userID = user.uid;
    userRef = firebase.firestore().collection('users').doc(userID);

    userRef.get().then(async (doc) => {
      if (doc.exists) {
        const userData = doc.data();
        if (userData.color != "") imgField.attr('src', userData.imgURL).css("filter", `sepia(100%) hue-rotate(${userData.color}deg)`)
        else imgField.attr('src', userData.imgURL)


        if (userData.description != "") descripdField.val(userData.description)
        nameField.val(userData.name);
        passwordField.val(userData.password);
        emailField.val(userData.email);
      }
    })
  }
})

$('#save').click(async function () {
  let imgURL = "";
  if (await input[0].files.length != 0) {
    const file = input[0].files[0];
    const storagePath = 'images/' + userID + '/avatar.png';
    const fileRef = storageRef.ref().child(storagePath);

    await fileRef.listAll().then(async function (result) {
      await result.items.forEach(async function (fileRef) {
        await fileRef.delete()
        console.log(`фото пользователя с ID ${userID} удалено`);
        window.location.href = "index.html";
      });
    })

    await fileRef.put(file).then(async function (snapshot) {
      await snapshot.ref.getDownloadURL().then(function (url) {
        imgURL = url; 
      }).catch((error) => {
        console.error('Произошла ошибка: ' + error.message);
      });
    }).catch((error) => {
      console.error('Произошла ошибка: ' + error.message);
    });
  }
  const userDoc = usersCollection.doc(userID);

  if (descripdField.val() == "")return console.log("текст пуст") ;

  userDoc.set({
    description: descripdField.val(), 
    name: nameField.val(),
    password: passwordField.val(),
    email: emailField.val(), 
    imgURL: imgURL,
  }, { merge: true }).then(function () {
    alert("данные успешно обнавленны и сохранены")
    console.log("Новые поля успешно добавлены в документ пользователя.");
  })
    .catch(function (error) {
      console.error("Ошибка при добавлении новых полей в документ пользователя: ", error);
    });
})

$('#delete-account').click(async function () {
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
