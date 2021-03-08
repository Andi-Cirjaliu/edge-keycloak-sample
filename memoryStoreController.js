const session = require('express-session');

const store1 = new session.MemoryStore();
const store2 = new session.MemoryStore();

const printStore(store) {
    console.log(store.sessions);
}

module.exports = {store1, store2, printStore};