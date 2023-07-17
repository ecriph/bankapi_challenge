export function generateAccountNumber() {
  const bankCode = '202';
  const min = 10000000; // Minimum value (inclusive)
  const max = 99999999; // Maximum value (inclusive)

  // Generate a random number within the specified range
  const randomNumber = Math.floor(Math.random() * (max - min + 1) + min);

  return bankCode + randomNumber;
}
