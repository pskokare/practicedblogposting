const moment = require('moment-timezone');

/**
 * Get current Indian time (Asia/Kolkata timezone)
 * @returns {Date} Current Indian time as Date object
 */
function getIndianTime() {
  return moment.tz('Asia/Kolkata').toDate();
}

/**
 * Convert Indian time string to UTC Date for storage
 * @param {string} indianTimeString - Time in Indian format (e.g., "2026-04-07T17:40:00")
 * @returns {Date} UTC Date object for database storage
 */
function indianTimeToUTC(indianTimeString) {
  if (!indianTimeString) return null;
  
  // Parse the input as Indian time and convert to UTC
  const indianMoment = moment.tz(indianTimeString, 'Asia/Kolkata');
  return indianMoment.toDate();
}

/**
 * Convert UTC Date to Indian time for display
 * @param {Date} utcDate - UTC Date from database
 * @returns {Date} Indian time as Date object
 */
function utcToIndianTime(utcDate) {
  if (!utcDate) return null;
  
  return moment(utcDate).tz('Asia/Kolkata').toDate();
}

/**
 * Format Indian time for display
 * @param {Date} date - Date object
 * @returns {string} Formatted Indian time string
 */
function formatIndianTime(date) {
  if (!date) return '';
  
  return moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Check if scheduled time has arrived in Indian timezone
 * @param {Date} scheduledTime - Scheduled time (UTC)
 * @returns {boolean} True if scheduled time has passed
 */
function hasScheduledTimeArrived(scheduledTime) {
  if (!scheduledTime) return false;
  
  const currentIndianTime = getIndianTime();
  const scheduledIndianTime = utcToIndianTime(scheduledTime);
  
  return scheduledIndianTime <= currentIndianTime;
}

module.exports = {
  getIndianTime,
  indianTimeToUTC,
  utcToIndianTime,
  formatIndianTime,
  hasScheduledTimeArrived
};
