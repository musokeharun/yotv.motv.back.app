const {DateTime} = require("luxon");
let dateTime = DateTime.fromObject({zone: 'Africa/Kampala'});


console.log(DateTime.fromMillis(1619451911638).toString());

module.exports = dateTime;