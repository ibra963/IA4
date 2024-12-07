const { ObjectId } = require('mongodb');

function Salesman(firstname, lastname) {
    this.firstname = firstname;
    this.lastname = lastname;
    this.records = [];
}

function SocialPerformanceRecord(category, targetValue, actualValue, year) {
    this.rid = new ObjectId().toHexString(); // Eindeutige ID für jeden Record
    this.category = category;
    this.targetValue = targetValue;
    this.actualValue = actualValue;
    this.year = year;
    this.bonus = actualValue < targetValue ? 20 : actualValue === targetValue ? 50 : 100;
}

Salesman.prototype.addSocialRecord = function (record) {
    if (!(record instanceof SocialPerformanceRecord)) {
        throw new Error('Ungültiges Objekt. Erwartet wird ein SocialPerformanceRecord.');
    }

    // Prüfen, ob der Record bereits existiert
    if (this.records.some(r => r.rid === record.rid)) {
        throw new Error('Dieser Performance Record wurde bereits hinzugefügt.');
    }

    this.records.push(record);
    return this;
};

module.exports = { Salesman, SocialPerformanceRecord };
