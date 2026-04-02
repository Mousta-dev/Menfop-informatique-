require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Defined' : 'Undefined');
console.log('PORT:', process.env.PORT);
