const firebaseAdmin = require('../config/firebaseAdmin');

const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    return { uid, email, name, picture };
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid ID token');
  }
};

module.exports = verifyIdToken;
