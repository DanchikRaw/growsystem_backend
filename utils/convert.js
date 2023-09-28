module.exports.minutesToHoursFormat = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return parseFloat(hours + "." + remainingMinutes);
}
