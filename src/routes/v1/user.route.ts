import express from "express";

import { userController } from "@controllers";
import { authMiddleware } from "@middlewares";

const router = express.Router();

// When declaring "*" as the path, the callback function systematically executes before calling any route
// Or, you can scope it to only some paths of the /users endpoint, like so: router.all('/path')

// router.all('*', (req, res, next) => {
// 	const task = 'do something before calling any route'
// 	next()
// })

// The .route() method allows to append multiple methods onto the same route path name
router
  .route("/")
  .get(authMiddleware("getUsers"), userController.queryAll)
  .post(authMiddleware("manageUsers"), userController.create);

router
  .route("/:uid")
  .get(authMiddleware("getUsers"), userController.get)
  .patch(authMiddleware("manageUsers"), userController.update)
  .delete(authMiddleware("manageUsers"), userController.remove);

export default router;
