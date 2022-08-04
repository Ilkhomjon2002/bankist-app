function persistence(num) {
  let counter = 1;
  let digits = 1;
  console.log(typeof digits);

  while (digits < 3) {
    digits++;
    console.log(digits);
    result = num
      .toString()
      .split('')
      .reduce((acc, curr) => acc * curr, 1);
    digits = result.toString().length;
    counter++;
    console.log(counter);
  }

  return counter;
}
