const {DateTime} = require("luxon");
let dateTime = DateTime.fromObject({zone: 'Africa/Kampala'});

console.log(DateTime.now().toString());

module.exports = dateTime;