const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createLog } = require('../controllers/logs');

const keyFilePath = path.resolve(__dirname, '../key.json');

exports.decrypt = (encryptedText) => {
    const { encryptionKey, encryptionIv } = loadEncryptionKeys();

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), Buffer.from(encryptionIv, 'hex'));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

exports.encrypt = (plaintext) => {
    const { encryptionKey, encryptionIv } = loadEncryptionKeys();

    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, encryptionIv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};


exports.generateEncryptionKeys = () => {
    if (!fs.existsSync(keyFilePath)) {
        const key = crypto.randomBytes(32).toString('hex');
        const iv = crypto.randomBytes(16).toString('hex');

        const keyData = { encryptionKey: key, encryptionIv: iv };

        fs.writeFileSync(keyFilePath, JSON.stringify(keyData, null, 2), { mode: 0o600 });

        createLog('Success', 'Encryption keys generated and stored to key.json', 'generateEncryptionKeys');
    } else {
        createLog('Info', 'Using existing encryption keys found in key.json', 'generateEncryptionKeys');
    }
};

const loadEncryptionKeys = () => {
    if (!fs.existsSync(keyFilePath)) {
        console.error('Encryption keys not found, stopping server');
        process.exit(1);
    }

    const keyData = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    return {
        encryptionKey: Buffer.from(keyData.encryptionKey, 'hex'),
        encryptionIv: Buffer.from(keyData.encryptionIv, 'hex'),
    };
};
