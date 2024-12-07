const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

// Get all performance records
router.get('/', async (req, res) => {
    const db = req.app.get('db');
    try {
        const performanceRecords = await db.collection('performanceRecords').find().toArray();
        res.json(performanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Fehler beim Abrufen der Performance Records', error: error.message });
    }
});

// Get a specific performance record by ID
router.get('/:id', async (req, res) => {
    const db = req.app.get('db');
    const recordId = req.params.id;

    if (!ObjectId.isValid(recordId)) {
        return res.status(400).json({ message: 'Ungültige Performance Record-ID' });
    }

    try {
        const record = await db.collection('performanceRecords').findOne({ _id: new ObjectId(recordId) });
        if (record) {
            res.json(record);
        } else {
            res.status(404).json({ message: 'Performance Record nicht gefunden' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Fehler beim Abrufen des Performance Records', error: error.message });
    }
});

// Add a new performance record
router.post('/', async (req, res) => {
    const db = req.app.get('db');
    const { category, targetValue, actualValue, year } = req.body;

    if (!category || targetValue === undefined || actualValue === undefined || year === undefined) {
        return res.status(400).json({ message: "category, targetValue, actualValue und year sind erforderlich." });
    }

    const bonus = actualValue < targetValue ? 20 : actualValue === targetValue ? 50 : 100;

    const newRecord = {
        category,
        targetValue,
        actualValue,
        year,
        bonus,
    };

    try {
        const result = await db.collection('performanceRecords').insertOne(newRecord);
        res.status(201).json({ _id: result.insertedId, ...newRecord });
    } catch (error) {
        res.status(500).json({ message: 'Fehler beim Hinzufügen des Performance Records', error: error.message });
    }
});

// Update a performance record
router.put('/:id', async (req, res) => {
    const db = req.app.get('db');
    const recordId = req.params.id;
    const { category, targetValue, actualValue, year } = req.body;

    if (!ObjectId.isValid(recordId)) {
        return res.status(400).json({ message: 'Ungültige Performance Record-ID' });
    }

    if (!category || targetValue === undefined || actualValue === undefined || year === undefined) {
        return res.status(400).json({ message: "Category, targetValue, actualValue und year sind erforderlich." });
    }

    const bonus = actualValue < targetValue ? 20 : actualValue === targetValue ? 50 : 100;

    try {
        const updateResult = await db.collection('performanceRecords').updateOne(
            { _id: new ObjectId(recordId) },
            { $set: { category, targetValue, actualValue, year, bonus } }
        );

        if (updateResult.matchedCount === 0) {
            res.status(404).json({ message: 'Performance Record nicht gefunden' });
        } else {
            res.json({ message: 'Performance Record aktualisiert', updatedRecord: { category, targetValue, actualValue, year, bonus } });
        }
    } catch (error) {
        res.status(500).json({ message: 'Fehler beim Aktualisieren des Performance Records', error: error.message });
    }
});

// Delete a performance record
router.delete('/:id', async (req, res) => {
    const db = req.app.get('db');
    const recordId = req.params.id;

    // Validierung der Performance Record-ID
    if (!ObjectId.isValid(recordId)) {
        return res.status(400).json({ message: 'Ungültige Performance Record-ID' });
    }

    try {
        // Löschen des Performance Records aus der Datenbank
        const deleteResult = await db.collection('performanceRecords').deleteOne({ _id: new ObjectId(recordId) });
        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ message: 'Performance Record nicht gefunden' });
        }

        // Entfernen des Records aus allen Salesmen
        await db.collection('salesmen').updateMany(
            { 'records.rid': recordId }, // Bedingung: Salesmen mit diesem Record
            { $pull: { records: { rid: recordId } } } // Entfernen des Records aus der Liste
        );

        res.status(200).json({ message: 'Performance Record erfolgreich gelöscht und bei allen Salesmen entfernt.' });
    } catch (error) {
        res.status(500).json({ message: 'Fehler beim Löschen des Performance Records.', error: error.message });
    }
});

module.exports = router;