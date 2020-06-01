module.exports = {
  productionSourceMap: false,
  transpileDependencies: ["vuetify"],
  css: {
    loaderOptions: {
      scss: {
        prependData: `
          @import "@/styles/app.scss";
        `
      }
    }
  }
}