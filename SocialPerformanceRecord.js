/**
 * this model specifies the format to exchange userdata with the frontend and store it in mongoDB
 * @param {int} rid
 * @param {string} category
 * @param {int} targetValue
 * @param {int} actualValue
 * @param {int} bonus
 */
class SocialPerformanceRecord{
    constructor(rid, category, targetValue, actualValue,year,bonus) {
        this.rid = rid;
        this.category = category;
        this.targetValue = targetValue;
        this.actualValue = actualValue;
        this.bonus = bonus;
        this.year = year;
    }
}

module.exports = SocialPerformanceRecord;