'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.178Z',
    '2020-01-28T09:15:04.908Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-03-18T17:01:17.194Z',
    '2022-03-20T15:36:17.929Z',
    '2022-03-28T10:51:36.790Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.178Z',
    '2020-01-28T09:15:04.908Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-11T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
let currentAccount, timer;

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

  const daysPassed = calcDaysPassed(new Date(), new Date(date));
  if (daysPassed === 0) return 'Today';
  else if (daysPassed === 1) return 'Yesterday';
  else if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  }
};
const formatCur = (locale, currency, movement) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(movement);
};
const displayMovements = (acc, sort = false) => {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach((movement, i) => {
    const displayDate = formatMovementDate(acc.movementsDates[i], acc.locale);
    const formattedMovement = formatCur(acc.locale, acc.currency, movement);
    const type = movement > 0 ? 'deposit' : 'withdrawal';
    const html = `<div class="movements__row">
   <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
   <div class="movements__date">${displayDate}</div>
   <div class="movements__value">${formattedMovement}</div>
 </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
let sorted = false;
btnSort.addEventListener('click', () => {
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

const createUserName = accs => {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserName(accounts);

const calcDisplayBalance = acc => {
  acc.balance = acc.movements.reduce((sum, mov) => sum + mov, 0);
  labelBalance.textContent = `${formatCur(
    acc.locale,
    acc.currency,
    acc.balance
  )}`;
};

const calcDisplaySummary = acc => {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((sum, cur) => sum + cur, 0);
  const outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((sum, cur) => sum + cur, 0);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(mov => mov * 0.012)
    .filter(mov => mov >= 1)
    .reduce((sum, curr) => sum + curr, 0);
  labelSumIn.textContent = `${formatCur(acc.locale, acc.currency, incomes)}`;
  labelSumOut.textContent = `${formatCur(acc.locale, acc.currency, outcomes)}`;
  labelSumInterest.textContent = `${formatCur(
    acc.locale,
    acc.currency,
    interest
  )}`;
};

const updateUI = acc => {
  //Display movements
  displayMovements(currentAccount);

  //Display balance
  calcDisplayBalance(currentAccount);

  //Display summary
  calcDisplaySummary(currentAccount);
};

const startLogout = () => {
  labelTimer.textContent = ``;

  let time = 10;
  const tick = () => {
    time--;

    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timerId);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
  };
  tick();

  let timerId = setInterval(tick, 1000);

  return timerId;
};

//Clear input
const clearInput = (...inputClasses) => {
  inputClasses.forEach(className => {
    const input = document.querySelector(className);
    input.value = '';
    input.blur();
  });
};
//--------------IMPLEMENT LOGIN ----------------

btnLogin.addEventListener('click', e => {
  e.preventDefault();

  currentAccount = accounts.find(acc => {
    return acc.username === inputLoginUsername.value;
  });
  if (currentAccount?.pin === +inputLoginPin.value) {
    //Display UI and message

    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 1;

    const now = new Date();

    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: '2-digit',
      year: 'numeric',
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    //Timer

    if (timer) clearInterval(timer);
    timer = startLogout();
    //Update UI
    updateUI(currentAccount);
    // Clear input fields
    clearInput('.login__input--user', '.login__input--pin');
  }
});

// ------------- IMPLEMENT TRANSFER ---------------

btnTransfer.addEventListener('click', e => {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const recieverAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  if (
    amount > 0 &&
    recieverAccount &&
    amount <= currentAccount.balance &&
    recieverAccount?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    recieverAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    recieverAccount.movementsDates.push(new Date().toISOString());
    //Update UI
    updateUI(currentAccount);

    //Timer

    if (timer) clearInterval(timer);
    timer = startLogout();
    // Clear input fields

    clearInput('.form__input--to', '.form__input--amount');
  }
});

//-------------IMPLEMENT DELETE ACCOUNT----------
btnClose.addEventListener('click', e => {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === inputCloseUsername.value
    );

    accounts.splice(index, 1);

    //Hide UI update message

    labelWelcome.textContent = 'Log in to get started';

    containerApp.style.opacity = 0;

    //clear input fields
    clearInput('.form__input--user', '.form__input--pin');
  }
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();
  const amount = +inputLoanAmount.value;
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(() => {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      //Timer

      if (timer) clearInterval(timer);
      timer = startLogout();

      updateUI(currentAccount);
    }, 2500);
  }

  clearInput('.form__input--loan-amount');
});
/////////////////////////////////////////////////
