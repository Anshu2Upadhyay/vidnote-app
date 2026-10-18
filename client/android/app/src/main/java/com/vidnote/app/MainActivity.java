package com.vidnote.app;

import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onBackPressed() {
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.evaluateJavascript(
                "if (typeof window.handleVidNoteBack === 'function') { window.handleVidNoteBack(); } else { window.history.back(); }",
                null
            );
            return;
        }
        super.onBackPressed();
    }
}
