/* global io, feathers */
// Establish a Socket.io connection

const socket = io();
const client = feathers();

client.configure(feathers.socketio(socket));

client.configure(feathers.authentication());

client.configure(feathers.authentication({
  storage: window.localStorage,
}));


const login = async credentials => {
  try {
    if (!credentials) {

      // Try to authenticate using an existing token
      await client.reAuthenticate();
    } else {
      // Otherwise log in with the `local` strategy using the credentials we got
      await client.authenticate({
        ...credentials,
      });
    }

    // If successful, show the main page
    showMain();
  } catch (error) {
    // If we got an error, show the login page
    showLogin(error);
  }
};

const showLogin = (error) => {
  if (document.querySelectorAll('.login').length && error) {
    document.querySelector('.heading').insertAdjacentHTML('beforeend', `<p>There was an error: ${error.message}</p>`);
  } else {
    document.getElementById('app').innerHTML = loginHTML;
  }
};

const signUpUser = async () => {
  try {
    await client.service('users').create({
      firstName: document.querySelector('[name="firstName"]').value,
      lastName: document.querySelector('[name="lastName"]').value,
      email: document.querySelector('[name="email"]').value,
      password: document.querySelector('[name="password"]').value,
    });
    showLogin();
  } catch (error) {
    // console.log(error);
    document.querySelector('.heading').insertAdjacentHTML('beforeend', `<p>There was an error: ${error.message}</p>`);
  }
};

// const loginUser = async () => {
//   try {
//     await client.authenticate({
//       email: document.querySelector('[name="email"]').value,
//       password: document.querySelector('[name="password"]').value,
//     });
//     await showMain();
//   } catch (error) {
//     console.log(error);
//     document.querySelector('.heading').insertAdjacentHTML('beforeend', `<p>There was an error: ${error.message}</p>`);
//   }
// };

const loginHTML = `<main class="login container">
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet text-center heading">
      <h1 class="font-100">Log in</h1>
    </div>
  </div>
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet col-4-desktop push-4-desktop">
      <form class="form">
        <fieldset>
          <input class="block" type="email" name="email" placeholder="email">
        </fieldset>

        <fieldset>
          <input class="block" type="password" name="password" placeholder="password">
        </fieldset>

        <button type="button" id="login" class="button button-primary block signup">
          Log in
        </button>

        <button type="button" id="signup" class="button button-primary block signup">
          Sign up
        </button>

      </form>
    </div>
  </div>
</main>`;

const signUpHTML = `<main class="login container">
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet text-center heading">
      <h1 class="font-100">Sign up</h1>
    </div>
  </div>
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet col-4-desktop push-4-desktop">
      <form class="form">
        <fieldset>
          <input class="block" type="text" name="firstName" placeholder="firstName">
        </fieldset>
        <fieldset>
          <input class="block" type="text" name="lastName" placeholder="lastName">
        </fieldset>
        <fieldset>
          <input class="block" type="email" name="email" placeholder="email">
        </fieldset>
        <fieldset>
          <input class="block" type="password" name="password" placeholder="password">
        </fieldset>
        <button type="button" id="signupuser" class="button button-primary block signup">
          Sign up
        </button>
        <a class="button button-primary block" id="backtologin" href="#">
          Back to login page
        </a>
      </form>
    </div>
  </div>
</main>`;

const mainHTML = `<nav class="navbar navbar-expand-lg navbar-light fixed-top" style="background-color: #fde3fd;">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Notifications</a>
     <div class="d-flex">
      <button class="btn btn-outline-success" type="submit">RING</button>
    </div>

    <div class="d-flex">
      <button class="btn btn-outline-success" type="submit">Logout</button>
    </div>
  </div>
</nav>
<div style="transform: none; visibility: visible; z-index: 1000; top: 54px" class="offcanvas offcanvas-start" tabindex="-1" aria-labelledby="offcanvasLabel">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title" id="offcanvasLabel">Offcanvas?????</h5>
    <p class="counter"></p>
  </div>
  <div class="notification offcanvas-body">
  </div>
</div>`;


const showMain = async () => {
  document.getElementById('app').innerHTML = mainHTML;
  const notif = await client.service('notifications').find();
  // console.log(notif);
  //await client.service('notifications').on('created', addMessage);
  document.querySelector('.counter').innerHTML += `<span>Counter: ${notif.total}</span>`;
  for (let i = 0; notif.data.length; i++) {
    document.querySelector('.notification').innerHTML += `
    <div class="card">
      <div class="card-body">
        <p class="card-text">${notif.data[i].description}</p>
        <p class="card-text">${notif.data[i].type}</p>
      </div>
    </div>`;
  }
  // //await client.service('notifications').on('connection').emit(client.service('notifications').find())
  // await client.service('notifications').on('connection', client.service('notifications').find({
  //   query: {
  //     isRead: true,
  //   },
  // }));
  //await client.service('notifications').on('created', ()=> {console.log("TEST")});
};


const getCredentials = () => {
  const user = {
    email: document.querySelector('[name="email"]').value,
    password: document.querySelector('[name="password"]').value,
  };
  return user;
};

const addEventListener = (selector, event, handler) => {
  document.addEventListener(event, async ev => {
    if (ev.target.closest(selector)) {
      handler(ev);
    }
  });
};

addEventListener('#login', 'click', async () => {
  const user = getCredentials();
  await login(user);
  //await loginUser();
});

addEventListener('#signup', 'click', async () => {
  document.getElementById('app').innerHTML = signUpHTML;
});

addEventListener('#backtologin', 'click', async () => {
  document.getElementById('app').innerHTML = loginHTML;
});

addEventListener('#signupuser', 'click', async () => {
  await signUpUser();
});

addEventListener('#logout', 'click', async () => {
  document.getElementById('app').innerHTML = loginHTML;
});

// const addMessage = message => {
//   console.log(message);
//   const { description ,type } = message;
//   const chat = document.querySelector('.chat');
//   // Escape HTML to prevent XSS attacks
//   //const text = escape(message.userId);
//   if (chat) {
//     chat.innerHTML += `<div class="message flex flex-row">
//       <div class="message-wrapper">
//         <p class="message-header">
//           <span class="username font-600">${escape(description)}</span>
//         </p>
//         <p class="message-content font-300">${type}</p>
//       </div>
//     </div>`;
//     // Always scroll to the bottom of our message list
//     chat.scrollTop = chat.scrollHeight - chat.clientHeight;
//   }
// };

login();
