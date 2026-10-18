package com.servicehub

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    DefaultReactHost.getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
      jsEngine = DefaultReactHost.JSEngine.JSC, // Use JSC instead of Hermes
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
