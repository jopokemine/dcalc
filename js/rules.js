/*

calculate final classification based on l5/l6 marks

rules:

a) the classification of the weighted mean of all relevant credits at Level 5
and all relevant credits at Level 6 in the ratio of 40:60 respectively after
first discounting the marks in the worst 20 credits both at Level 5 and at Level
6; b) the classification of the weighted mean of all relevant credits at Level 6
after first discounting the marks in the worst 20 credits at Level 6; c) the
minimum classification in which more than 50% of the combined relevant credits
at Level 5 and Level 6 were attained after first discounting the marks in the
worst 20 credits both at Level 5 and at Level 6

rules summary:
a) l5mean * 0.4 + l6mean * 0.6
b) l6mean
c) just past the middle

marks are an object like this:

{
  l5: [ 45, 56, 34, 75, 43, 89 ],
  l6: [ 65, 76, 87, 67 ],
  l7: {
    credits15: [],
    credits30: [],
  }
  fyp: 73,
  gip: null,
}

*/

const gpaZones = [
  [75, 100, 4.25],
  [71, 74, 4.0],
  [67, 70, 3.75],
  [64, 66, 3.5],
  [61, 63, 3.25],
  [57, 60, 3.0],
  [54, 56, 2.75],
  [50, 53, 2.5],
  [48, 48, 2.25],
  [43, 47, 2.0],
  [40, 42, 1.5],
  [38, 38, 1.0],
  [35, 37, 0.75],
  [30, 34, 0.5],
  [0, 28, 0.0],
];

function prepareMarks(marks) {
  marks.prepared = {};

  marks.prepared.l5 = marks.l5.slice();
  marks.prepared.l5.sort(reverseNumericalComparison);
  marks.prepared.l5.length = 5;

  marks.prepared.l6 = marks.l6.slice();
  marks.prepared.l6.push(marks.fyp); // Add fyp once, as if it was worth 20 credits. This way, 20
  // credits of it can be dropped if the project is lowest
  marks.prepared.l6.sort(reverseNumericalComparison);
  marks.prepared.l6.length = 4;

  marks.prepared.l6.push(marks.fyp); // Add fyp a second time, to make up the 40 credits
  marks.prepared.l6.sort(reverseNumericalComparison);

  // add GPA
  marks.prepared.l5gpa = marks.prepared.l5.map(gradeToGPA);
  marks.prepared.l6gpa = marks.prepared.l6.map(gradeToGPA);
}

function reverseNumericalComparison(a, b) {
  return b - a;
}

function gradeToGPA(num) {
  num = Math.round(num); // round up from .5
  num = num % 10 == 9 ? num + 1 : num; // round nines up
  for (const zone of gpaZones) {
    if (num >= zone[0] && num <= zone[1]) return zone[2];
  }
  return -999;
}

function gpa(marks) {
  const weightedl5mean = mean(marks.prepared.l5gpa) * 0.4;
  const weightedl6mean = mean(marks.prepared.l6gpa) * 0.6;
  return Number(weightedl5mean + weightedl6mean).toFixed(2);
}

function ruleA(marks) {
  const l5mean = mean(marks.prepared.l5);
  const l6mean = mean(marks.prepared.l6);
  return roundDown(l5mean * 0.4 + l6mean * 0.6);
}

function ruleB(marks) {
  return roundDown(mean(marks.prepared.l6));
}

function ruleC(marks) {
  const allMarks = marks.prepared.l5.concat(marks.prepared.l6);
  allMarks.sort(reverseNumericalComparison);
  return roundDown(allMarks[allMarks.length / 2]);
}

function mean(array) {
  return array.reduce((a, b) => a + b) / array.length;
}

function roundDown(num, digits = 2) {
  const str = String(num);
  const [whole, decimal] = str.split(".");
  const padded = (decimal || "00").padEnd(digits, "0");
  return whole + "." + padded.substring(0, 2);
}

function toClassification(mark) {
  if (mark < 40) return "Failed";
  if (mark < 50) return "Third-class honours";
  if (mark < 60) return "Second-class honours (lower division)";
  if (mark < 70) return "Second-class honours (upper division)";
  return "First-class honours";
}

/* for testing

const marks = {
    l5: [45, 56, 67, 78, 89, 90],
    l6: [56, 67, 78, 89],
    fyp: 68,
}
*/
