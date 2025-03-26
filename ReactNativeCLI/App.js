import React, { useEffect, useState } from "react";
import { WebView } from "react-native-webview";

export default function HomeScreen() {
  const [embedConfig, setEmbedConfig] = useState(null);

  const apiHost = "http://10.0.2.2:8080";  // Use emulator IP instead of localhost
  const authorizationServerAPI='/authorizationserver';
  const getDetailsUrl='/getdetails';

  useEffect(() => {
    fetch(apiHost+getDetailsUrl)
      .then((response) => response.json())
      .then((data) => setEmbedConfig(data))
      .catch((error) => console.error("Error fetching embed config:", error));
  }, []);

  if (!embedConfig) return null;

  const { ServerUrl, DashboardId, SiteIdentifier } = embedConfig;

  const customHTML = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style="margin:0;padding:0;overflow:hidden;">
        <div id="dashboardContainer" style="width:100%;height:100vh;"></div>
      </body>
    </html>`;

  const injectedJavaScript = `
    (function() {
      function loadScript(url, callback) {
        var script = document.createElement('script');
        script.src = url;
        script.onload = callback;
        script.onerror = function() {
          window.ReactNativeWebView.postMessage("Script loading failed.");
        };
        document.head.appendChild(script);
      }

      function renderDashboard() {
        try {
          const dashboard = BoldBI.create({
              serverUrl: "${ServerUrl + '/' + SiteIdentifier}",
              dashboardId: "${DashboardId}",
              embedContainerId: "dashboardContainer",
              authorizationServer: {
                  url: "${apiHost+authorizationServerAPI}"
              }
            });
          dashboard.loadDashboard();
        } catch (error) {
          console.error("Error loading dashboard:", error);
        }
      }

      loadScript('https://cdn.boldbi.com/embedded-sdk/v11.2.7/boldbi-embed.js', renderDashboard);
    })();
    true;
  `;

  return (
    <WebView
      source={{ html: customHTML }}
      mixedContentMode="always"
      injectedJavaScript={injectedJavaScript}
      javaScriptEnabled={true}
      originWhitelist={["*"]}
      onMessage={(event) => console.log("WebView message:", event.nativeEvent.data)}
    />
  );
}