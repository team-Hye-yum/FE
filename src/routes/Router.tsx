import { Route, Routes } from "react-router-dom";
import Main from "../pages/Main/Main";

const Router = () => {
  return (
    <Routes>
      <Route index element={<Main />} />
    </Routes>
  );
};

export default Router;
