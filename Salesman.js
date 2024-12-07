const express = require('express');
const { ObjectId } = require('mongodb');
const { Salesman, SocialPerformanceRecord } = require('../services/Salesman_manage');
const router = express.Router();


// Get all salesmen
router.get('/', async (req, res) => {
    const db = req.app.get('db');
    try {
        const salesmen = await db.collection('salesmen').find().toArray();
        res.json(salesmen);
    } catch (error) {
        res.status(500).json({ message: 'Fehler beim Abrufen der Salesmen', error: error.message });
    }
});

// Get a specific salesman by ID
router.get('/:id', async (req, res) => {
    const db = req.app.get('db');
    const salesmanId = req.params.id;
    try {
        const salesman = await db.collection('salesmen').findOne({ _id: new ObjectId(salesmanId) });
        if (!salesman) {
            res.status(404).json({ message: 'Salesman nicht gefunden' });
        } else {
            res.json(salesman);
        }
    } catch (error) {
        res.status(500).json({ message: 'Fehler beim Abrufen des Salesman', error: error.message });
    }
});

// Add a new salesman
router.post('/', async (req, res) => {
    const db = req.app.get('db');
    const { firstname, lastname } = req.body;

    if (!firstname || !lastname) {
        return res.status(400).json({ message: 'Vor- und Nachname sind erforderlich.' });
    }

    const newSalesman = new Salesman(firstname, lastname);

    try {
        const result = await db.collection('salesmen').insertOne(newSalesman);
        res.status(201).json({ _id: result.insertedId, ...newSalesman });
    } catch (error) {
        res.status(500).json({ message: 'Fehler beim Hinzufügen des Salesman', error: error.message });
    }
});

// Update a salesman
router.put('/:id', async (req, res) => {
    const db = req.app.get('db');
    const salesmanId = req.params.id;
    const { firstname, lastname, records } = req.body;

    try {
        const updateResult = await db.collection('salesmen').updateOne(
            { _id: new ObjectId(salesmanId) },
            { $set: { firstname, lastname, records } }
        );

        if (updateResult.matchedCount === 0) {
            res.status(404).json({ message: 'Salesman nicht gefunden' });
        } else {
            res.json({ message: 'Salesman aktualisiert' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Fehler beim Aktualisieren des Salesman', error: error.message });
    }
});

// Delete a salesman
router.delete('/:id', async (req, res) => {
    const db = req.app.get('db');
    const salesmanId = req.params.id;

    try {
        const deleteResult = await db.collection('salesmen').deleteOne({ _id: new ObjectId(salesmanId) });
        if (deleteResult.deletedCount === 0) {
            res.status(404).json({ message: 'Salesman nicht gefunden' });
        } else {
            res.json({ message: 'Salesman gelöscht' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Fehler beim Löschen des Salesman', error: error.message });
    }
});

// Add a performance record to a salesman
router.put('/:id/records', async (req, res) => {
    const db = req.app.get('db');
    const salesmanId = req.params.id;
    const { rid } = req.body;

    // Validierung der IDs
    if (!ObjectId.isValid(salesmanId)) {
        return res.status(400).json({ message: 'Ungültige Salesman-ID' });
    }

    if (!ObjectId.isValid(rid)) {
        return res.status(400).json({ message: 'Ungültige Performance Record-ID' });
    }

    try {
        // Abrufen des Performance Records aus der Datenbank
        const recordData = await db.collection('performanceRecords').findOne({ _id: new ObjectId(rid) });
        if (!recordData) {
            return res.status(404).json({ message: 'Performance Record nicht gefunden' });
        }

        // Umwandeln des Datenbank-Objekts in eine Instanz von SocialPerformanceRecord
        const record = new SocialPerformanceRecord(
            recordData.category,
            recordData.targetValue,
            recordData.actualValue,
            recordData.year
        );
        record.rid = recordData._id.toString(); // Beibehalten der ursprünglichen ID

        // Abrufen des Salesman
        const salesman = await db.collection('salesmen').findOne({ _id: new ObjectId(salesmanId) });
        if (!salesman) {
            return res.status(404).json({ message: 'Salesman nicht gefunden' });
        }

        // Salesman-Instanz erstellen und Record hinzufügen
        const updatedSalesman = new Salesman(salesman.firstname, salesman.lastname);
        updatedSalesman.records = salesman.records || [];
        updatedSalesman.addSocialRecord(record);

        // Aktualisierte Records speichern
        await db.collection('salesmen').updateOne(
            { _id: new ObjectId(salesmanId) },
            { $set: { records: updatedSalesman.records } }
        );

        res.status(200).json({
            message: 'Performance Record erfolgreich hinzugefügt.',
            updatedSalesman,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Fehler beim Hinzufügen des Performance Records.',
            error: error.message,
        });
    }
});

module.exports = router;