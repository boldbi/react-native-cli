import React from "react";
import { WebView } from "react-native-webview";

export default function HomeScreen() {
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
            serverUrl: "http://172.16.203.208/bi/api/site/site1",
            dashboardId: "939bb278-8f9f-4a82-8123-bae55d5ea3cb",
            embedContainerId: "dashboardContainer",
            token: "NTg4Yzk1YTMtZTVhOS00NjRiLTgyNzEtNjlkMjRjZWJlMTg2"
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