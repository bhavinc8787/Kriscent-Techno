// role check middleware
module.exports = function(allowed = []){
  return function(req, res, next){
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    if (!Array.isArray(allowed)) allowed = [allowed];
    if (allowed.length === 0) return next();
    if (!allowed.includes(user.role)) return res.status(403).json({ message: 'Forbidden - insufficient role' });
    next();
  }
}
