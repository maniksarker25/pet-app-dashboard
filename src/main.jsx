import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { RouterProvider } from "react-router-dom";
import { App as AntApp, ConfigProvider } from "antd";
import "./index.css";

import { router } from "./routes/Router";
import { persistor, store } from "./redux/store";
import { antdTheme } from "./theme";
import { cleanupLegacyStorage } from "./utils/session";
import FullPageLoader from "./components/FullPageLoader";

cleanupLegacyStorage();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<FullPageLoader />} persistor={persistor}>
        <ConfigProvider theme={antdTheme}>
          <AntApp>
            <RouterProvider router={router} />
          </AntApp>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
);
