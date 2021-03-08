const session = require('express-session');
const MemoryStore = require('memorystore')(session);

const store1 = new MemoryStore({checkPeriod: 3600000 });
// const store1 = new session.MemoryStore();
const store2 = new session.MemoryStore();

const printStore = (store) => {
    console.log(store);
}

const printStores = () => {
    console.log(store1);
    console.log(store2);
}

module.exports = {store1, store2, printStore, printStores};