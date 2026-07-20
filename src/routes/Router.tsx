import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import BtpSolution from "@/pages/BtpSolution/BtpSolution";
import BusinessList from "@/pages/BusinessList/BusinessList";
import Main from "@/pages/Main/Main";

const Router = () => {
  return (
    <AppLayout>
      <Routes>
        <Route index element={<Main />} />
        <Route path="/business-list" element={<BusinessList />} />
        <Route path="/btp-solution" element={<BtpSolution />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </AppLayout>
  );
};

export default Router;
