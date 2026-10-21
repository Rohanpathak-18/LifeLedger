import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';
import { env } from '../../config/env.js';
import EmergencyInfo from '../../models/EmergencyInfo.js';

function keyFor(userId) {
  return createHash('sha256')
    .update(`${env.JWT_ACCESS_SECRET}:lifeledger-emergency:${userId}`)
    .digest();
}
export async function read(userId) {
  const record = await EmergencyInfo.findOne({ userId }).lean();
  if (!record) return { information: '' };
  const decipher = createDecipheriv(
    'aes-256-gcm',
    keyFor(userId),
    Buffer.from(record.iv, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(record.authTag, 'hex'));
  return {
    information: Buffer.concat([
      decipher.update(Buffer.from(record.ciphertext, 'hex')),
      decipher.final(),
    ]).toString('utf8'),
    updatedAt: record.updatedAt,
  };
}
export async function write(userId, information) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyFor(userId), iv);
  const ciphertext = Buffer.concat([
    cipher.update(information, 'utf8'),
    cipher.final(),
  ]);
  await EmergencyInfo.findOneAndUpdate(
    { userId },
    {
      $set: {
        iv: iv.toString('hex'),
        authTag: cipher.getAuthTag().toString('hex'),
        ciphertext: ciphertext.toString('hex'),
      },
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
  return { saved: true };
}
