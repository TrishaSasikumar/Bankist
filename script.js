'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-01-31T23:36:17.929Z',
    '2024-02-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2024-01-28T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
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

//format date
const formatMovementDate = function(date,locale)
{
  const calcDaysPassed=(d1,d2)=>Math.round(Math.abs((d1-d2))/(1000*60*60*24))
  // console.log(calcDaysPassed(new Date(2024,0,15),new Date(2024,0,30)))
  const daysPassed =calcDaysPassed(new Date(),date)
  // console.log(daysPassed)
  if(daysPassed==0)return `Today`
  if (daysPassed==1)return `Yesterday`
  if (daysPassed<=7) return `${daysPassed} days ago`

  // const day = `${date.getDate()}`.padStart(2,0)
  // const month = `${date.getMonth()+1}`.padStart(2,0)
  // const year = date.getFullYear()
  // return `${day}/${month}/${year}`
  return new Intl.DateTimeFormat(locale).format(date);
}

//format currency
const formatCurrency = function(num,locale,currency)
{
  return new Intl.NumberFormat(locale,{
    style: 'currency',
    currency : currency,
  }).format(num)
}

//update UI
const updateUI=function(acc){
    //Display movements
    displayMovements(acc)
    //Display balance
    calcDisplaySummary(acc)
    //Dispaly Summary
    calcDisplayBalance(acc)
}


//Display balance
const calcDisplayBalance=function(acc){
  acc.balance=acc.movements.reduce((acc,val)=>acc+val)
  const curr=formatCurrency(acc.balance,acc.locale,acc.currency)
  labelBalance.textContent=`${curr}`
}
// calcDisplayBalance(account1.movements)

//Display Summary
const calcDisplaySummary=function(acc){
  const income=acc.movements
  .filter((mov)=>(mov>0))
  .reduce( ( acc,mov)=>acc+mov , 0)

  labelSumIn.textContent=`${formatCurrency(income,acc.locale,acc.currency)}`

  const out=acc.movements
  .filter((mov)=>mov<0)
  .reduce((acc,mov)=>acc+(mov),0)
  labelSumOut.textContent=`${formatCurrency(Math.abs(out),acc.locale,acc.currency)}`

  const interest=acc.movements.filter((mov)=>(mov>0))
  .map((deposit)=>(deposit*acc.interestRate/100))
  .filter((int,i,arr)=>{
    // console.log(arr)
    return int>=1
  })
  .reduce((acc,int)=>(acc+int),0)
  labelSumInterest.textContent=`${formatCurrency(interest,acc.locale,acc.currency)}`
}
// calcDisplaySummary(account1.movements)


//Display movements
const displayMovements = function(acc,sort=false)
{
  containerMovements.innerHTML=''
  const movs = sort ? acc.movements.slice().sort((a,b)=>a-b):acc.movements
  movs.forEach(function(mov,i){
  const movementDate = new Date(acc.movementsDates[i])
  const displayDate = formatMovementDate(movementDate,acc.locale)
  const formattedCur = formatCurrency(mov,acc.locale,acc.currency)

    const type = mov>0?'deposit':'withdrawal'
    const html=`
  <div class="movements__row">
   <div class="movements__type movements__type--${type}">${i} ${type}</div>
   <div class="movements__date">${displayDate}</div>
   <div class="movements__value">${formattedCur}</div>
  </div>`;
  containerMovements.insertAdjacentHTML('afterbegin',html)
  })
}
// displayMovements(account1.movements)


//Username
const usernames= function(accs)
{
  accs.forEach(function(acc){
    acc.username=acc.owner.toLowerCase().split(' ').map((u)=>u[0]).join('')
  })
}
usernames(accounts)
// console.log(accounts)


//Timer
const startLogoutTimer = function(){

  //Call timer every sec
  const tick=function(){
    const min = String(Math.trunc(time/60)).padStart(2,0)
    const sec = String(time%60).padStart(2,0)

    //print remaining time to UI
    labelTimer.textContent=`${min}:${sec}`

    //at 0 sec, logout
    if(time===0){
      clearInterval(timer)
      labelWelcome.textContent=`Login to get Started`
      containerApp.style.opacity=0
    }
    time--
  }

   //Set time to 5 min
  let time=120
  tick()
  const timer = setInterval(tick,1000)
  return timer

  }


//////////////////////////////////////
//EVENT HANDLERS
let currentAccount,timer;

//login
btnLogin.addEventListener('click',function(e){
  e.preventDefault()
  currentAccount= accounts.find((acc)=>acc.username===inputLoginUsername.value)
  // console.log(currentAccount)
  if (currentAccount?.pin === +inputLoginPin.value){  //⛔️⛔️input in string form⛔️⛔️
    // console.log('LOGIN')

  //Change focus
  inputLoginPin.value=inputLoginUsername.value=''
  inputLoginPin.blur()

  //Display msg and ui
  labelWelcome.textContent=`Welcome back, ${currentAccount.owner.split(" ")[0]}`
  containerApp.style.opacity=100

  // Create current date and time
  const now = new Date();
  const options = {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "numeric",//long
    year: "numeric",
    // weekday: 'long',
  };
  // const locale = navigator.language;
    // console.log(locale);]
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    //   const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;
    if(timer) clearInterval(timer)
    timer=startLogoutTimer();
  
    //Update UI
  updateUI(currentAccount)
  }
})


// //FAKE LOGIN
// currentAccount=account1
// containerApp.style.opacity=100;
// updateUI(currentAccount)

// const now = new Date()
// const date = `${now.getDate()}`.padStart(2,0)
// const month = `${now.getMonth()+1}`.padStart(2,0)
// const year = now.getFullYear()
// const displayDate = `${date}/${month}/${year}`
// labelDate.textContent=displayDate

//transfer
btnTransfer.addEventListener('click',function(e){
  e.preventDefault()
  const receiverAcc=accounts.find(acc=>acc.username===inputTransferTo.value)
  const amount=+inputTransferAmount.value
  inputTransferAmount.value=inputTransferTo.value=''
  inputTransferAmount.blur()
  // console.log(receiverAcc,amount)
  if(amount>0 && receiverAcc && receiverAcc.username !== currentAccount.username && amount<currentAccount.balance){
    currentAccount.movements.push(-amount)
    currentAccount.movementsDates.push(new Date().toISOString())
    receiverAcc.movements.push(amount)
    receiverAcc.movementsDates.push(new Date().toISOString())
    //Update
    updateUI(currentAccount)
    //Reset timer
    clearInterval(timer)
    timer=startLogoutTimer();
  }
})


//remove acc
btnClose.addEventListener('click',function(e){
  e.preventDefault()
  if(inputCloseUsername.value === currentAccount.username && +inputClosePin.value ===currentAccount.pin)
  {
    const ind=accounts.findIndex((acc)=>acc.username===currentAccount.username)
    console.log(ind)
    //Delete account
    accounts.splice(ind,1)
    // console.log(accounts)
    containerApp.style.opacity=0;
    labelWelcome.textContent=`Log in to get started`;
  }
  inputCloseUsername.value = inputClosePin.value = '';
})


//loan
btnLoan.addEventListener('click',function(e){
  e.preventDefault()
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) 
  {
    // Add movement
   setTimeout(function(){ currentAccount.movements.push(amount);
    //Add Date
    currentAccount.movementsDates.push(new Date().toISOString())
    // Update UI
    updateUI(currentAccount);
    //Reset timer
    clearInterval(timer)
    timer=startLogoutTimer();
  },2500
    
  )
}
  inputLoanAmount.value = '';
})

// let count=0
// btnSort.addEventListener('click',function(e){
//   e.preventDefault()
//   count++
//   displayMovements(currentAccount.movements,count%2==1?true:false)
// })

//Better Solution
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

