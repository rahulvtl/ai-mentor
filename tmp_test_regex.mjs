const lowerQuery = "interactive vectors";
const regex = /\b(angle|angles|vector|vectors|trigo|trigonometry)\b/;
console.log("Matches:", regex.test(lowerQuery));
console.log("Match [0]:", lowerQuery.match(regex)?.[0]);
