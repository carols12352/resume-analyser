const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '' // 移除 /api 前缀
      },
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({
          error: 'Proxy Error',
          message: 'Failed to connect to the backend server'
        });
      },
      onProxyReq: (proxyReq, req, res) => {
        // 记录请求信息
        console.log(`${req.method} ${req.path} -> ${proxyReq.path}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        // 记录响应状态
        console.log(`${req.method} ${req.path} -> ${proxyRes.statusCode}`);
      }
    })
  );
}; 