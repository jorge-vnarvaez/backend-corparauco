module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1338),
  app: {
    keys: [
    	"jorge.vnarvaez@gmail.com",
    	"%FWl9S3gfm*zje(h0!"
    ],
  },
});
