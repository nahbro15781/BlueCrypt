const PASSWORDS_KEY = 'bluecrypt_all_passwords';
const ADMINS_KEY = 'bluecrypt_admin_users';

const OWNER_ADMIN = {
  username: 'Owner15',
  password: 'Aryan.Qasimi@1',
};

const CHAR_SETS = {
  low: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  medium: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  high: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?',
};

function fnv1a(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

function generatePassword(username, length, strength) {
  const chars = CHAR_SETS[strength] || CHAR_SETS.medium;
  const seed = fnv1a(username + 'BlueCryptSecret2025!');
  let password = '';
  let rand = seed;

  for (let i = 0; i < length; i++) {
    rand = (rand * 1664525 + 1013904223) % 4294967296;
    const index = rand % chars.length;
    password += chars.charAt(index);
  }

  return password;
}

function generateRandomPassword(length = 12) {
  const chars = CHAR_SETS.high;
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function savePassword(username, password, type) {
  const allPasswords = JSON.parse(localStorage.getItem(PASSWORDS_KEY)) || [];
  allPasswords.push({ username, password, type });
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(allPasswords));
}

function loadAllPasswordsIntoTable(tableBodyId, noPasswordsMsgId) {
  const allPasswords = JSON.parse(localStorage.getItem(PASSWORDS_KEY)) || [];
  const tbody = document.getElementById(tableBodyId);
  tbody.innerHTML = '';

  if (allPasswords.length === 0) {
    document.getElementById(noPasswordsMsgId).style.display = 'block';
    document.getElementById(tbody.parentElement.id).style.display = 'none';
  } else {
    document.getElementById(noPasswordsMsgId).style.display = 'none';
    document.getElementById(tbody.parentElement.id).style.display = 'table';

    allPasswords.forEach(({ username, password, type }) => {
      const row = document.createElement('tr');

      const userTd = document.createElement('td');
      userTd.textContent = username;
      userTd.style.cursor = 'pointer';
      userTd.title = 'Click to copy username';
      userTd.addEventListener('click', () => copyToClipboard(username));

      const passTd = document.createElement('td');
      passTd.textContent = password;
      passTd.style.cursor = 'pointer';
      passTd.title = 'Click to copy password';
      passTd.addEventListener('click', () => copyToClipboard(password));

      const typeTd = document.createElement('td');
      typeTd.textContent = type;

      row.appendChild(userTd);
      row.appendChild(passTd);
      row.appendChild(typeTd);

      tbody.appendChild(row);
    });
  }
}

function loadAdmins() {
  let admins = JSON.parse(localStorage.getItem(ADMINS_KEY));
  if (!admins) {
    admins = [OWNER_ADMIN]; // seed with owner admin
    localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
  }
  return admins;
}

function saveAdmins(admins) {
  localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
}

function isValidAdminLogin(username, password) {
  const admins = loadAdmins();
  return admins.some((a) => a.username === username && a.password === password);
}

function addAdmin(username, password) {
  const admins = loadAdmins();
  if (!admins.find((a) => a.username === username)) {
    admins.push({ username, password });
    saveAdmins(admins);
    return true;
  }
  return false;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => alert(`Copied "${text}" to clipboard!`));
}

function switchSection(sectionId) {
  document.querySelectorAll('main > section').forEach((section) => {
    section.style.display = section.id === sectionId ? 'block' : 'none';
  });

  // Highlight active nav button
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.remove('active');
  });
  if (sectionId === 'home-section') {
    document.getElementById('nav-home').classList.add('active');
  } else if (sectionId === 'admin-section') {
    document.getElementById('nav-admin').classList.add('active');
  } else if (sectionId === 'passwords-section') {
    document.getElementById('nav-passwords').classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  switchSection('home-section');

  // NAV BUTTONS
  document.getElementById('nav-home').addEventListener('click', () => {
    switchSection('home-section');
  });

  document.getElementById('nav-passwords').addEventListener('click', () => {
    switchSection('passwords-section');
    loadAllPasswordsIntoTable('all-passwords-body', 'no-passwords-msg');
  });

  document.getElementById('nav-admin').addEventListener('click', () => {
    switchSection('admin-section');
    document.getElementById('admin-login-form').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
  });

  // GENERATE PASSWORD (HOME)
  document.getElementById('generate-user-btn').addEventListener('click', () => {
    const username = document.getElementById('username-input').value.trim();
    const length = parseInt(document.getElementById('password-length').value, 10);
    const strength = document.getElementById('password-strength').value;

    if (!username) {
      alert('Please enter a username');
      return;
    }
    if (isNaN(length) || length < 8 || length > 20) {
      alert('Password length must be between 8 and 20');
      return;
    }

    const password = generatePassword(username, length, strength);
    savePassword(username, password, 'user');

    document.getElementById('user-password-output').textContent = `Generated Password: ${password}`;
  });

  // ADMIN LOGIN
  document.getElementById('admin-login-btn').addEventListener('click', () => {
    const username = document.getElementById('admin-login-username').value.trim();
    const password = document.getElementById('admin-login-password').value;

    if (!username || !password) {
      document.getElementById('admin-login-error').textContent = 'Please enter username and password';
      return;
    }

    if (isValidAdminLogin(username, password)) {
      document.getElementById('admin-login-error').textContent = '';
      document.getElementById('admin-login-form').style.display = 'none';
      document.getElementById('admin-dashboard').style.display = 'block';
      document.getElementById('admin-username-display').textContent = username;
      loadAllPasswordsIntoTable('admin-passwords-body', 'no-admin-passwords-msg');
    } else {
      document.getElementById('admin-login-error').textContent = 'Invalid admin username or password';
    }
  });

  // DELETE ALL PASSWORDS
  document.getElementById('delete-all-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all passwords? This cannot be undone.')) {
      localStorage.removeItem(PASSWORDS_KEY);
      loadAllPasswordsIntoTable('admin-passwords-body', 'no-admin-passwords-msg');
      document.getElementById('delete-confirmation').textContent = 'All passwords deleted.';
      setTimeout(() => {
        document.getElementById('delete-confirmation').textContent = '';
      }, 3000);
    }
  });

  // GENERATE ADMIN PASSWORD (ADMIN DASHBOARD)
  document.getElementById('generate-admin-btn').addEventListener('click', () => {
    const newAdminUsername = document.getElementById('admin-username-gen').value.trim();
    if (!newAdminUsername) {
      alert('Enter new admin username');
      return;
    }
    const newPassword = generateRandomPassword(12);
    if (addAdmin(newAdminUsername, newPassword)) {
      alert(`New admin created:\nUsername: ${newAdminUsername}\nPassword: ${newPassword}`);
      document.getElementById('admin-username-gen').value = '';
    } else {
      alert('Admin username already exists');
    }
  });

  // ADMIN LOGOUT
  document.getElementById('admin-logout-btn').addEventListener('click', () => {
    document.getElementById('admin-login-username').value = '';
    document.getElementById('admin-login-password').value = '';
    document.getElementById('admin-login-error').textContent = '';
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('admin-login-form').style.display = 'block';
  });
});
