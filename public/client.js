/* global io, feathers */
// Establish a Socket.io connection
const socket = io();
const client = feathers();

let userFirstName = '';

client.configure(feathers.socketio(socket));

client.configure(feathers.authentication());

client.configure(feathers.authentication({
  storage: window.localStorage,
}));


const login = async credentials => {
  try {
    if (!credentials) {
      // Try to authenticate using an existing token
      const response = await client.reAuthenticate();
      //console.log(response);
      getCurrentUser(response.user);
    } else {
      // Otherwise log in with the `local` strategy using the credentials we got
      const response = await client.authenticate({
        ...credentials,
      });
      //console.log(response);
      getCurrentUser(response.user);
    }
    // If successful, show the main page
    showMain();
  } catch (error) {
    // If we got an error, show the login page
    showLogin(error);
  }
};

function getCurrentUser (user) {
  userFirstName = user.firstName;
}

const getCredentials = () => {
  const user = {
    email: document.querySelector('[name="email"]').value,
    password: document.querySelector('[name="password"]').value,
  };
  return user;
};

const showLogin = (error) => {
  if (document.querySelectorAll('.login').length && error) {
    document.querySelector('.heading').insertAdjacentHTML('beforeend', `<p>There was an error: ${Object.values(error.errors)} ${error.message}</p>`);
  } else {
    document.getElementById('app').innerHTML = loginHTML;
  }
};

const signUp = async () => {
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
    document
      .querySelector('.heading')
      .insertAdjacentHTML('beforeend', `<p>There was an error: ${Object.values(error.errors)}  ${error.message}</p>`);
  }
};

const showMain = async () => {
  document.getElementById('app').innerHTML = mainHTML;
  await countTotalUnread();
  await showAllReadNotifications();
  await setUserInHeader();
};

const setUserInHeader = () => {
  document.getElementById('navbar-name').textContent = `Hello, ${userFirstName}`;
};

async function checkAsRead(id) {
  await client.service('notifications').patch(id, { isRead: true });
}

const countTotalUnread = async () => {
  const { total } = await client.service('notifications').find({
    query: {
      isRead: false,
      $limit: 0,
    },
  });
  document.querySelector('.count').textContent = total;
};

const addUnreadMessage = () => {
  let addOne = parseInt(document.querySelector('.count').textContent) + 1;
  document.querySelector('.count').textContent = addOne.toString();
};

const removeUnreadMessage = () => {
  let removeOne = parseInt(document.querySelector('.count').textContent) - 1;
  document.querySelector('.count').textContent = removeOne.toString();

  let addReadNotifications = parseInt(document.querySelector('#all-read').textContent) + 1;
  document.querySelector('#all-read').textContent = addReadNotifications.toString();

};

const showAllReadNotifications = async () => {
  const readNotifications = await client.service('notifications').find({
    query: {
      isRead: true,
    },
  });
  document.querySelector('#all-read').textContent = readNotifications.total;
  for (let i = 0; i < readNotifications.data.length; i++) {
    document.querySelector('.notification').innerHTML += `
    <div class="card mb-3" id="card-${i}">
        <div class="card-header">
           ${readNotifications.data[i].type}
        </div>
        <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted">${readNotifications.data[i].updatedAt}</h6>
            <p class="card-text">${readNotifications.data[i].description}</p>
        </div>
    </div>`;
    const el = document.querySelector(`#card-${i}`);
    switch (readNotifications.data[i].type) {
    case 'DOWNLOAD_READY':
      el.className += ' border-danger';
      break;
    case 'REPORT_CREATED':
      el.className += ' border-warning';
      break;
    case 'TERMS_UPDATED':
      el.className += ' border-success';
      break;
    default:
      el.className += ' border-primary';
    }
  }
};

const showAllUnreadNotifications = async () => {
  const unreadNotifications = await client.service('notifications').find({
    query: {
      isRead: false,
    },
  });
  document.querySelector('.dropdown-menu').innerHTML = '';
  const el = document.querySelector('.dropdown-menu');
  for (let i = 0; i < unreadNotifications.data.length; i++) {
    const div = document.createElement('span');
    div.innerHTML += `
     <div class="card mb-3" id="new-card-${i}">
        <div class="card-header">
           ${unreadNotifications.data[i].type}
        </div>
       <div class="card-body">
         <p class="card-text text-muted">${unreadNotifications.data[i].description}</p>
       </div>
     </div>`;

    div.addEventListener('click', () => {
      checkAsRead(unreadNotifications.data[i].id);
    });
    el.appendChild(div);

    const card = document.querySelector(`#new-card-${i}`);

    switch (unreadNotifications.data[i].type) {
    case 'DOWNLOAD_READY':
      card.className += ' border-danger';
      break;
    case 'REPORT_CREATED':
      card.className += ' border-warning';
      break;
    case 'TERMS_UPDATED':
      card.className += ' border-success';
      break;
    default:
      card.className += ' border-primary';
    }
  }
};

const showReadedNotification = message => {
  const cardId = Math.floor(Math.random() * 1000);
  const { description ,type, updatedAt } = message;
  const showMessages = document.querySelector('.notification');
  if (showMessages) {
    showMessages.innerHTML += `
    <div class="card mb-3" id="card-${cardId}">
        <div class="card-header">
           ${type}
        </div>
        <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted">${updatedAt}</h6>
            <p class="card-text">${description}</p>
        </div>
    </div>`;
    const el = document.querySelector(`#card-${cardId}`);
    switch (type) {
    case 'DOWNLOAD_READY':
      el.className += ' border-danger';
      break;
    case 'REPORT_CREATED':
      el.className += ' border-warning';
      break;
    case 'TERMS_UPDATED':
      el.className += ' border-success';
      break;
    default:
      el.className += ' border-primary';
    }
    // Always scroll to the bottom of our notification list
    showMessages.scrollTop = showMessages.scrollHeight - showMessages.clientHeight;
  }
};


const loginHTML = `<main class="login container">
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet text-center heading">
      <h1 class="font-100">Log in</h1>
    </div>
  </div>
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet col-4-desktop push-4-desktop">
      <form class="form d-flex flex-column">
        <fieldset>
          <input class="block" type="email" name="email" placeholder="email">
        </fieldset>

        <fieldset>
          <input class="block" type="password" name="password" placeholder="password">
        </fieldset>

        <button type="button" id="login" class="btn btn-warning btn-lg mb-3">
          Log in
        </button>

        <button type="button" id="signup" class="btn btn-warning btn-lg">
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
      <form class="form d-flex flex-column">
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
        <button type="button" id="signupuser" class="btn btn-warning btn-lg mb-3">
          Sign up
        </button>
        <a class="btn btn-warning btn-lg" id="backtologin" href="#">
          Back to login page
        </a>
      </form>
    </div>
  </div>
</main>`;

const mainHTML = `<nav class="navbar navbar-expand-lg navbar-light fixed-top" style="background-color: rgb(103,103,103);">
  <div class="container-fluid">
    <span style="font-family: monospace; font-size: 1.5rem; color: #ffc107" class="navbar-brand" id="navbar-name"></span>
    <div class="dropdown">
    <button class="btn btn-warning dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
    Unread notifications <span class="count"></span>
     </button>
    <ul class="dropdown-menu p-3" aria-labelledby="dropdownMenuButton1">
    </ul>
    </div>

    <div class="d-flex">
      <button class="btn btn-warning" id="logout" type="submit">Logout</button>
    </div>
  </div>
</nav>
<div style="transform: none; visibility: visible; z-index: 1000; top: 54px" class="offcanvas offcanvas-start" tabindex="-1" aria-labelledby="offcanvasLabel">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title" id="offcanvasLabel">All read notifications: <span id="all-read"></span></h5>
  </div>
  <div class="notification offcanvas-body">
  </div>
</div>`;


const addEventListener = (selector, event, handler) => {
  document.addEventListener(event, async ev => {
    if (ev.target.closest(selector)) {
      handler(ev);
    }
  });
};

addEventListener('#login', 'click', async () => {
  const user = getCredentials();
  userFirstName = user;
  await login(user);
});

addEventListener('#signup', 'click', async () => {
  document.getElementById('app').innerHTML = signUpHTML;
});

addEventListener('#backtologin', 'click', async () => {
  document.getElementById('app').innerHTML = loginHTML;
});

addEventListener('#signupuser', 'click', async () => {
  await signUp();
});

addEventListener('#dropdownMenuButton1', 'click', async () => {
  await showAllUnreadNotifications();
});

addEventListener('#logout', 'click', async () => {
  localStorage.clear();
  socket.disconnect();
  // try {
  //   console.log('STTTarTTT')
  //   client.logout()
  // } catch (err) {
  //   console.log(err)
  // }
  document.getElementById('app').innerHTML = loginHTML;
});

client.service('notifications').on('created', addUnreadMessage);

client.service('notifications').on('patched', removeUnreadMessage);

client.service('notifications').on('patched', showReadedNotification);

login();
