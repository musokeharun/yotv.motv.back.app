const {DateTime} = require("luxon");
let dateTime = DateTime.fromObject({zone: 'Africa/Kampala'});
module.exports = dateTime;