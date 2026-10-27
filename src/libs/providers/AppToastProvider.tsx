//Files: src/libs/providers/AppToastProvider.tsx

"use client";

import type React from "react";
import { Slide, ToastContainer, type ToastContainerProps } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Props = {
  children: React.ReactNode;
  containerProps?: ToastContainerProps;
};

/**
 * Bungkus layout/app dengan provider ini
 * supaya ToastContainer hanya 1x di seluruh app.
 */
export const AppToastProvider: React.FC<Props> = ({ children, containerProps }) => {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Slide}
        {...containerProps}
      />
    </>
  );
};

export default AppToastProvider;
