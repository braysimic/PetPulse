module.exports = function requireAdmin(req, res, next) {
	if (!req.session.userId) {
	  return res.status(401).send({ error: "Not logged in." });
	}
  
	if (req.session.role !== "admin") {
	  return res.status(403).send({ error: "Admin access required." });
	}
  
	next();
  };
  