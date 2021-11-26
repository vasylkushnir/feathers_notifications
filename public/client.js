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
  await setUserInHeader();
  await countTotalUnread();

};

const setUserInHeader = () => {
  document.getElementById('navbar-name').textContent = `Hello, ${userFirstName}`;
};

async function checkAsRead(id) {
  await client.service('notifications').patch(id, { isRead: true });
}

const updateAllNotifications = async  () => {
  await client.service('notifications').patch(null, { isRead: true } );
};

const countTotalUnread = async () => {
  const { total } = await client.service('notifications').find({
    query: {
      isRead: false,
      $limit: 0,
    },
  });
  if (total > 0) {
    document.querySelector('.count').textContent = total;
  } else {
    document.getElementById('badge').style.display = 'none';
  }
};

const addUnreadMessage = () => {
  let counter = parseInt(document.querySelector('.count').textContent);
  if (!counter) {
    document.getElementById('badge').style.display = 'inline-block';
    counter = 0;
  }
  counter++;
  document.querySelector('.count').textContent = counter.toString();
};

const removeUnreadMessage = () => {
  let counter = parseInt(document.querySelector('.count').textContent);
  if (counter > 0) {
    counter--;
    document.querySelector('.count').textContent = counter.toString();
  }
  if (counter === 0) {
    document.getElementById('badge').style.display = 'none';
  }
};

const showAllUnreadNotifications = async () => {
  const unreadNotifications = await client.service('notifications').find();
  document.querySelector('.dropdown-menu').innerHTML = '<div id="readAll" class="d-grid gap-2 mb-3"><button type="button" class="btn btn-success">Read all notifications</button></div>';
  const el = document.querySelector('.dropdown-menu');
  $('.dropdown-menu').click(function(e) {
    e.stopPropagation();
  });
  for (let i = 0; i < unreadNotifications.data.length; i++) {
    const div = document.createElement('span');
    div.innerHTML += `
     <div class="card mb-3" id="new-card-${i}">
       <div class="div">
        <div id="img-${i}" style="width: 50px;padding: 10px;" class="col-md-4">
        </div>
         <div class="col-md-8">
         <div class="card-body">
           <p class="card-text">${unreadNotifications.data[i].description}</p>
         </div>
        </div>
       </div>
     </div>`;

    div.addEventListener('click', () => {
      if (!unreadNotifications.data[i].isRead) {
        card.classList.remove('bg-warning');
        card.className += ' border-warning';

        checkAsRead(unreadNotifications.data[i].id);
      }
    });
    $('#readAll').click(function() {
      updateAllNotifications();
      card.classList.remove('bg-warning');
      card.className += ' border-warning';
    });
    el.appendChild(div);

    const card = document.querySelector(`#new-card-${i}`);
    const img = document.querySelector(`#img-${i}`);

    unreadNotifications.data[i].isRead ?
      card.className += ' border-warning' :
      card.className += ' bg-warning';


    switch (unreadNotifications.data[i].type) {
    case 'DOWNLOAD_READY':
      img.innerHTML += `
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
</svg>
        `;
      break;
    case 'REPORT_CREATED':
      img.innerHTML += `
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-info-square" viewBox="0 0 16 16">
  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
</svg>
        `;
      break;
    case 'TERMS_UPDATED':
      img.innerHTML += `
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-file-earmark-font" viewBox="0 0 16 16">
  <path d="M10.943 6H5.057L5 8h.5c.18-1.096.356-1.192 1.694-1.235l.293-.01v5.09c0 .47-.1.582-.898.655v.5H9.41v-.5c-.803-.073-.903-.184-.903-.654V6.755l.298.01c1.338.043 1.514.14 1.694 1.235h.5l-.057-2z"/>
  <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
</svg>
        `;
      break;
    default:
      img.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-file-earmark-font" viewBox="0 0 16 16">
      <path d="M10.943 6H5.057L5 8h.5c.18-1.096.356-1.192 1.694-1.235l.293-.01v5.09c0 .47-.1.582-.898.655v.5H9.41v-.5c-.803-.073-.903-.184-.903-.654V6.755l.298.01c1.338.043 1.514.14 1.694 1.235h.5l-.057-2z"/>
      <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
    </svg>`;
    }
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

const mainHTML = `<nav class="navbar navbar-expand-lg navbar-light fixed-top" style="background-color: rgb(150,150,150);">
  <div class="d-flex justify-content-between px-3 w-100 align-items-center">
    <div class="dropdown">
    <button class="btn btn-warning  position-relative" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-bell-fill" viewBox="0 0 16 16">
  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
</svg>
     <span class="position-absolute top-0 start-100 translate-middle text-white badge rounded-pill bg-danger" id="badge">
        <span class="count"></span>
     </span>

     </button>
    <div style="width: 700px;max-height: 900px;overflow: auto;" class="dropdown-menu p-3" aria-labelledby="dropdownMenuButton1">
    </div>
    </div>
    <span style="font-family: monospace; font-size: 1.5rem; color: #ffc22a; line-height: 2rem;" class="navbar-brand" id="navbar-name"></span>
    <div class="d-flex">
      <button class="btn btn-warning" id="logout" type="submit">Logout</button>
    </div>
  </div>
</nav>
`;


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

addEventListener('#readAll', 'click', async () => {
  await updateAllNotifications();
});

addEventListener('#logout', 'click', async () => {
  client.logout();
  localStorage.clear();
  socket.disconnect();
  document.getElementById('app').innerHTML = loginHTML;
  location.reload();
});

client.service('notifications').on('created', addUnreadMessage);

client.service('notifications').on('patched', removeUnreadMessage);

login();
