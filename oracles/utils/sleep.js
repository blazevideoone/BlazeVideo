module.exports = async function sleep(timeout) {
  timeout = timeout ||
      (process.env.SLEEP_TIME ? parseInt(process.env.SLEEP_TIME) : null) ||
      15 * 1000;
  return new Promise((resolve, reject) => {
    console.log("Sleep for " + timeout + " ms.................");
    setTimeout(function() {
      console.log("Sleep done!");
      resolve();
    }, timeout);
  });
}
