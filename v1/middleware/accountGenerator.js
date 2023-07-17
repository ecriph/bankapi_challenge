export function generateAccountNumber() {
  const bankCode = '202';
  const min = 1000000; // Minimum value (inclusive)
  const max = 9999999; // Maximum value (inclusive)

  // Generate a random number within the specified range
  const randomNumber = Math.floor(Math.random() * (max - min + 1) + min);

  return bankCode + randomNumber;
}
