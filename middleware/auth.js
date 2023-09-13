// Custom middleware for authentication and authorization
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // If the user is authenticated, continue to the next middleware/route handler
    return next();
  }
  // If not authenticated, redirect to the login page or send an error message
  res.redirect("/login"); // You can customize the redirection URL
}



// Another example: Protecting routes by role
function isAuthorized(role) {
  return (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    }
    // If not authorized, redirect or send an error message
    res.redirect("/unauthorized"); // Customize the URL or error message
  };
}

module.exports={
    isAuthenticated,
    isAuthorized
}


