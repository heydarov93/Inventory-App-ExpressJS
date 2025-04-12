function setNotificationMessage(req, res, next) {
  const { status } = req.query;
  if (status === "success") {
    res.locals.notification = "Operation is successfull.";
  } else if (status === "fail") {
    res.locals.notification = "Operation failed.";
  }
  res.locals.status = status;

  next();
}

module.exports = setNotificationMessage;
