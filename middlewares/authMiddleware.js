import jwt from 'jsonwebtoken';

// after checks
const token = jwt.sign(
  { email, role },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
);

return res.status(200).send({
  success: true,
  message: 'login success',
  token
});