function setCurrentPath(req, res, next) {
  res.locals.currentPath = req.path;
  next();
}

module.exports = setCurrentPath;
