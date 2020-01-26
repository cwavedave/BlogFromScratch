//jshint esversion:6

exports.getDate = function() {

  const today = new Date();

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "numeric",
  };

  return today.toLocaleDateString("en-ES", options);

};

exports.getDay = function () {

  const today = new Date();

  const options = {
    weekday: "long"
  };

  return today.toLocaleDateString("en-ES", options);

};
