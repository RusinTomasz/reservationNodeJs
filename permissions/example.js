const { ROLE } = require("../data");

function canViewProject(user, project) {
  return user.role === ROLE.ADMIN || project.userId === user.id;
}

function scopedProjects(user, projects) {
  if (user.role === ROLE.ADMIN) return projects;
  return projects.filter((project) => project.userId === user.id);
}

function canDeleteProject(user, project) {
  return project.userId === user.id;
}

module.exports = {
  canViewProject,
  scopedProjects,
  canDeleteProject,
};

// In routing
// function authGetProject(req, res, next) {
//     if (!canViewProject(req.user, req.project)) {
//       res.status(401)
//       return res.send('Not Allowed')
//     }

//     next()
//   }
