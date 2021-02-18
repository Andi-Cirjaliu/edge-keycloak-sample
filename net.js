const dns = require('dns');
const os = require('os');

console.log(os.hostname());
dns.lookup(os.hostname(), function (err, add, fam) {
    console.log('addr: ' + add);
  });

const ip = require('ip');
console.log(ip.address());
