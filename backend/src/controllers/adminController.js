const { db, admin } = require('../config/firebase.config');

const banUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Only allow if db is initialized
        if (!db.collection) {
           return res.status(500).json({ error: "Database not initialized. Missing Firebase config." });
        }

        await db.collection('users').doc(userId).update({
            status: 'banned',
            bannedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Optional: you can also disable the user in Firebase Auth so they can't log in again:
        try {
             await admin.auth().updateUser(userId, { disabled: true });
        } catch(authErr) {
             console.warn("Could not disable user in Auth: ", authErr.message);
        }

        res.status(200).json({ message: `User ${userId} has been banned.` });
    } catch (error) {
        console.error("Error banning user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const resolveFlag = async (req, res) => {
    try {
        const { flagId } = req.params;
        
        if (!flagId) {
            return res.status(400).json({ error: "Flag ID is required" });
        }
        
        if (!db.collection) {
            return res.status(500).json({ error: "Database not initialized." });
         }

        await db.collection('flags').doc(flagId).update({
            resolved: true,
            resolvedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ message: `Flag ${flagId} resolved.` });
    } catch (error) {
        console.error("Error resolving flag:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
   banUser,
   resolveFlag
};
