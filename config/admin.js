module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '861a850adfdaa1d9c688be3c2a9bfc5c'),
  },
});
