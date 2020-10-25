import React, { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import { useStore } from "../store/hook";
import { observer } from "mobx-react-lite";
import { auth } from "../services/firebase";

import LoginPage from "../pages/Login/Login";
import PrivateRoute from "./PrivateRoute";
import Dashboard from "../pages/Dashboard/Dashboard";
import Document from "../pages/Document/Document";
import ErrorsPage from "../pages/Errors/ErrorsPage";

const AppRoutes = observer(() => {
  let store = useStore();
  useEffect(
    () => {
      let unsubscribe = auth().onAuthStateChanged(user => store.syncUser())
      return () => unsubscribe()
    }
  )

  let isSignedIn = !!store.currentUser;

  console.log("INDEX  ", isSignedIn, store.currentUser);
  return (
    <Router>
      <Switch>
        {/* <PrivateRoute isSignedIn={isSignedIn} path="/project/:projectID/:permissionID/:typeID/:nameID">
          <InvitationCheck />
        </PrivateRoute> */}
        <PrivateRoute isSignedIn={isSignedIn} path="/project/:projectID">
          <Document />
        </PrivateRoute>
        <Route path="/login" isSignedIn={isSignedIn}  >
          <LoginPage />
        </Route>
        <PrivateRoute isSignedIn={isSignedIn} path="/dashboard">
          <Dashboard />
        </PrivateRoute>
        <Route path="/error">
          <ErrorsPage />
        </Route>
        <Redirect to="/login" />
      </Switch>
    </Router>
  );
})
export default AppRoutes;