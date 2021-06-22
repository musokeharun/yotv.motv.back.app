module.exports = {
    getGreetingTime: m => {
        let g = null; //return g
        const split_afternoon = 12; //24hr time to split the afternoon
        const split_evening = 17; //24hr time to split the evening
        if (m >= split_afternoon && m <= split_evening) {
            g = "afternoon";
        } else if (m >= split_evening) {
            g = "evening";
        } else {
            g = "morning";
        }
        return g;
    }
}