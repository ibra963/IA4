const express = require('express');
const router = express.Router();

// Lösche alle Salesmen
router.delete('/salesmen', async (req, res) => {
    const db = req.app.get('db');
    try {
        await db.collection('salesmen').deleteMany({});
        res.status(200).json({ message: 'Alle Salesmen erfolgreich gelöscht' });
    } catch (error) {
        res.status(500).json({ message: 'Fehler beim Löschen der Salesmen', error: error.message });
    }
});

// Lösche alle Performance Records
router.delete('/SocialPerformanceRecords', async (req, res) => {
    const db = req.app.get('db');
    try {
        await db.collection('performanceRecords').deleteMany({});
        res.status(200).json({ message: 'Alle Performance Records erfolgreich gelöscht' });
    } catch (error) {
        res.status(500).json({ message: 'Fehler beim Löschen der Performance Records', error: error.message });
    }
});

module.exports = router;
