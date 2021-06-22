const Date = require("../utils/Date")

const lastActivity = (user,table, db = null) => {
    if (!user.hasOwnProperty("id"))
        return;

    const database = db || require("../db/index");
    user['last_active'] = Date.toFormat("yyyy-LL-dd TT")
    database.ready(function () {
        database.table(table).save(user);
    })

}

module.exports = {
    lastActivity
}