// R Lab Practice — exercise and lesson data.
// "set" items are the learner's own practice questions (wording kept as given).
// "var" items are original practice variations written for this site.
// Tests are checked against real R results; nothing here is canned output.
const R = String.raw;

const PATTERNS = {
  input:      { name: "Input and conditions", short: "Input & if" },
  loops:      { name: "Loops", short: "Loops" },
  functions:  { name: "Functions and recursion", short: "Functions" },
  vectors:    { name: "Vectors, lists and matrices", short: "Vectors" },
  dataframes: { name: "Data frames and CSVs", short: "Data frames" },
  plots:      { name: "Plots", short: "Plots" },
};

// Test spec keys:
//  in: lines fed to readline()      nums / notNums: numbers that must / must not appear
//  last: the last number printed    text / notText: words (any case)
//  tok / notTok: exact standalone tokens (case-sensitive, e.g. grades)
//  numsR / textR / notTextR: R expressions, run after your code, giving values that must appear
//  check: R expression that must be TRUE after your code runs
//  plot: a plot must be drawn       use: regexes your code must contain (loop type, etc.)
//  d: plain-English description of the test

const EXERCISES = [
// ---------------- SET 1 ----------------
{ id: "s1q1", group: "set", set: 1, q: 1, pattern: "input", mode: "fill",
  title: "Arithmetic on two numbers",
  question: "Write an R program to accept two numbers and perform all arithmetic operations.",
  task: "Read two numbers with <code>readline()</code>. Print the sum, difference, product, quotient, remainder (<code>%%</code>) and integer division (<code>%/%</code>). Type the two numbers in the Input box, one per line.",
  starter: R`a <- as.numeric(readline("Enter first number: "))
b <- ___(readline("Enter second number: "))

cat("Sum:", a + b, "\n")
cat("Difference:", a ___ b, "\n")
cat("Product:", a * b, "\n")
cat("Quotient:", a / b, "\n")
cat("Remainder:", a ___ b, "\n")
cat("Integer division:", a %/% b, "\n")
cat("Power:", a ^ b, "\n")
`,
  solution: R`a <- as.numeric(readline("Enter first number: "))
b <- as.numeric(readline("Enter second number: "))

cat("Sum:", a + b, "\n")
cat("Difference:", a - b, "\n")
cat("Product:", a * b, "\n")
cat("Quotient:", a / b, "\n")
cat("Remainder:", a %% b, "\n")
cat("Integer division:", a %/% b, "\n")
cat("Power:", a ^ b, "\n")
`,
  hints: [
    "readline() always gives text. Wrap it in as.numeric() so R can do maths with it.",
    "Subtraction is a - b. The remainder operator in R is %% (two percent signs)."
  ],
  tests: [
    { in: ["12", "5"], nums: [17, 7, 60, 2.4, 2], d: "12 and 5 give sum 17, difference 7, product 60, quotient 2.4, remainder 2" },
    { in: ["9", "4"], nums: [13, 5, 36, 2.25, 1], d: "9 and 4 give 13, 5, 36, 2.25 and remainder 1" },
  ] },

{ id: "s1q2", group: "set", set: 1, q: 2, pattern: "vectors", mode: "fill",
  title: "Mean, median, variance, SD",
  question: "Create a vector of 10 numbers and calculate its mean, median, variance, and standard deviation.",
  task: "Store the 10 numbers in a vector named <code>x</code>. Print the mean, median, variance and standard deviation.",
  starter: R`# Create a vector of 10 numbers
x <- c(12, 15, 11, 18, 20, 14, 16, 19, 13, 17)

cat("Mean:", mean(x), "\n")
cat("Median:", ___(x), "\n")
cat("Variance:", ___(x), "\n")
cat("Standard deviation:", ___(x), "\n")
`,
  solution: R`# Create a vector of 10 numbers
x <- c(12, 15, 11, 18, 20, 14, 16, 19, 13, 17)

cat("Mean:", mean(x), "\n")
cat("Median:", median(x), "\n")
cat("Variance:", var(x), "\n")
cat("Standard deviation:", sd(x), "\n")
`,
  hints: [
    "R has a ready-made function for each one. Their names are short forms of the words.",
    "Use median(x), var(x) and sd(x)."
  ],
  tests: [
    { check: "is.numeric(x) && length(x) == 10", numsR: "c(mean(x), median(x), var(x), sd(x))",
      d: "x has 10 numbers, and its mean, median, variance and SD are printed" },
  ] },

{ id: "s1q3", group: "set", set: 1, q: 3, pattern: "vectors", mode: "fill",
  title: "Matrix transpose, row and column sums",
  question: "Create a matrix and calculate its transpose, row sums, and column sums.",
  task: "Store your matrix in <code>m</code> and its transpose in <code>tm</code>. Print the row sums and column sums.",
  starter: R`m <- matrix(1:6, nrow = 2, ncol = 3)
cat("Matrix:\n")
print(m)

tm <- ___(m)
cat("Transpose:\n")
print(tm)

cat("Row sums:", ___(m), "\n")
cat("Column sums:", colSums(m), "\n")
`,
  solution: R`m <- matrix(1:6, nrow = 2, ncol = 3)
cat("Matrix:\n")
print(m)

tm <- t(m)
cat("Transpose:\n")
print(tm)

cat("Row sums:", rowSums(m), "\n")
cat("Column sums:", colSums(m), "\n")
`,
  hints: [
    "The transpose function is a single letter.",
    "Use t(m) for the transpose and rowSums(m) for the row sums."
  ],
  tests: [
    { check: "is.matrix(m) && identical(tm, t(m))", numsR: "c(rowSums(m), colSums(m))",
      d: "tm equals t(m), and the row sums and column sums of m are printed" },
  ] },

// ---------------- SET 2 ----------------
{ id: "s2q1", group: "set", set: 2, q: 1, pattern: "dataframes", mode: "fill",
  title: "Students scoring above 75",
  question: "Create a student data frame with name, roll number, and marks. Display students scoring above 75.",
  task: "Make a data frame named <code>students</code> with columns <code>name</code>, <code>roll</code> and <code>marks</code>. Store the students with marks above 75 in <code>toppers</code> and print it.",
  starter: R`students <- data.frame(
  name  = c("Anu", "Bilal", "Chitra", "Devan", "Esha"),
  roll  = c(1, 2, 3, 4, 5),
  marks = c(82, 67, 91, 75, 78)
)

toppers <- students[students$___ > 75, ]
cat("Students scoring above 75:\n")
print(___)
`,
  solution: R`students <- data.frame(
  name  = c("Anu", "Bilal", "Chitra", "Devan", "Esha"),
  roll  = c(1, 2, 3, 4, 5),
  marks = c(82, 67, 91, 75, 78)
)

toppers <- students[students$marks > 75, ]
cat("Students scoring above 75:\n")
print(toppers)
`,
  hints: [
    "Inside the square brackets, the part before the comma picks rows. Compare the marks column with 75.",
    "Write students[students$marks > 75, ] and then print(toppers). Note that 75 itself is not above 75."
  ],
  tests: [
    { check: 'is.data.frame(students) && all(c("name","roll","marks") %in% names(students)) && is.data.frame(toppers) && nrow(toppers) == sum(students$marks > 75) && all(toppers$marks > 75)',
      textR: "as.character(toppers$name)",
      d: "toppers holds exactly the students with marks above 75, and their names are printed" },
  ] },

{ id: "s2q2", group: "set", set: 2, q: 2, pattern: "plots", mode: "fill",
  title: "Bar plot of marks in five subjects",
  question: "Draw a bar plot representing marks obtained in five subjects.",
  task: "Store the five marks in <code>marks</code> and the subject names in <code>subjects</code>. Draw a bar plot with a title and axis labels.",
  starter: R`marks <- c(78, 85, 62, 90, 71)
subjects <- c("Maths", "Physics", "Chemistry", "English", "R Lab")

barplot(___, names.arg = ___, col = "steelblue",
        main = "Marks in five subjects",
        xlab = "Subject", ylab = "Marks")
`,
  solution: R`marks <- c(78, 85, 62, 90, 71)
subjects <- c("Maths", "Physics", "Chemistry", "English", "R Lab")

barplot(marks, names.arg = subjects, col = "steelblue",
        main = "Marks in five subjects",
        xlab = "Subject", ylab = "Marks")
`,
  hints: [
    "barplot() needs the numbers first. names.arg gives the label under each bar.",
    "barplot(marks, names.arg = subjects, ...)"
  ],
  tests: [
    { check: "length(marks) == 5 && length(subjects) == 5", plot: true, use: ["barplot\\s*\\("],
      d: "marks and subjects have 5 values each, and barplot() draws a plot" },
  ] },

{ id: "s2q3", group: "set", set: 2, q: 3, pattern: "loops", mode: "fill",
  title: "Multiplication table with for",
  question: "Write an R program to display a multiplication table using a for loop.",
  task: "Read a number <code>n</code> with <code>readline()</code>. Use a <code>for</code> loop to print n x 1 up to n x 10.",
  starter: R`n <- as.integer(readline("Enter a number: "))

for (i in ___) {
  cat(n, "x", i, "=", ___, "\n")
}
`,
  solution: R`n <- as.integer(readline("Enter a number: "))

for (i in 1:10) {
  cat(n, "x", i, "=", n * i, "\n")
}
`,
  hints: [
    "The loop should go through the numbers 1 to 10. In R, 1:10 makes that sequence.",
    "The answer on each line is n * i."
  ],
  tests: [
    { in: ["7"], nums: [14, 21, 28, 35, 42, 49, 56, 63, 70], use: ["\\bfor\\s*\\("], d: "Input 7 prints 7, 14, 21 ... 70 using a for loop" },
    { in: ["13"], nums: [26, 39, 52, 65, 78, 91, 104, 117, 130], d: "Input 13 prints 13, 26 ... 130" },
  ] },

// ---------------- SET 3 ----------------
{ id: "s3q1", group: "set", set: 3, q: 1, pattern: "input", mode: "fill",
  title: "Day name with switch()",
  question: "Write an R program using switch() to display the name of a day based on a number from 1 to 7.",
  task: "Read a number. Use <code>switch()</code> so that 1 is Monday and 7 is Sunday. For any other number, print a message containing the word <em>Invalid</em>.",
  starter: R`n <- as.integer(readline("Enter a number (1-7): "))

day <- switch(n,
  "Monday", "Tuesday", "Wednesday", ___,
  "Friday", "Saturday", ___)

if (is.null(day)) {
  cat("Invalid number. Enter 1 to 7.\n")
} else {
  cat("Day", n, "is", day, "\n")
}
`,
  solution: R`n <- as.integer(readline("Enter a number (1-7): "))

day <- switch(n,
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday")

if (is.null(day)) {
  cat("Invalid number. Enter 1 to 7.\n")
} else {
  cat("Day", n, "is", day, "\n")
}
`,
  hints: [
    "When switch() gets a number, it returns the item at that position. Fill in the missing 4th and 7th day.",
    "The blanks are \"Thursday\" and \"Sunday\". switch() returns NULL for numbers outside 1 to 7, so is.null() catches them."
  ],
  tests: [
    { in: ["1"], text: ["Monday"], use: ["switch\\s*\\("], d: "1 gives Monday" },
    { in: ["4"], text: ["Thursday"], notText: ["Monday"], d: "4 gives Thursday" },
    { in: ["7"], text: ["Sunday"], d: "7 gives Sunday" },
    { in: ["9"], text: ["invalid"], d: "9 gives an Invalid message" },
  ] },

{ id: "s3q2", group: "set", set: 3, q: 2, pattern: "functions", mode: "fill",
  title: "Prime check function",
  question: "Write a user-defined function to check whether a number is prime.",
  task: "Write <code>is_prime(n)</code> that returns <code>TRUE</code> or <code>FALSE</code>. Then read a number and print whether it is prime. For a non-prime, the message must contain the word <em>not</em>.",
  starter: R`is_prime <- function(n) {
  if (n < 2) return(FALSE)
  if (n < 4) return(TRUE)          # 2 and 3 are prime
  for (i in 2:floor(sqrt(n))) {
    if (n %% i == ___) return(FALSE)
  }
  return(___)
}

num <- as.integer(readline("Enter a number: "))
if (is_prime(num)) {
  cat(num, "is a prime number\n")
} else {
  cat(num, "is not a prime number\n")
}
`,
  solution: R`is_prime <- function(n) {
  if (n < 2) return(FALSE)
  if (n < 4) return(TRUE)          # 2 and 3 are prime
  for (i in 2:floor(sqrt(n))) {
    if (n %% i == 0) return(FALSE)
  }
  return(TRUE)
}

num <- as.integer(readline("Enter a number: "))
if (is_prime(num)) {
  cat(num, "is a prime number\n")
} else {
  cat(num, "is not a prime number\n")
}
`,
  hints: [
    "A number is not prime if some i divides it with no remainder. What is the remainder then?",
    "Use n %% i == 0 inside the loop. If the loop finishes without finding a divisor, return(TRUE)."
  ],
  tests: [
    { check: "is_prime(2) && is_prime(3) && is_prime(97) && !is_prime(0) && !is_prime(1) && !is_prime(9) && !is_prime(91)",
      d: "is_prime() is TRUE for 2, 3, 97 and FALSE for 0, 1, 9, 91" },
    { in: ["7"], text: ["prime"], notText: ["not"], d: "Input 7 says prime" },
    { in: ["9"], text: ["not"], d: "Input 9 says not prime" },
  ] },

{ id: "s3q3", group: "set", set: 3, q: 3, pattern: "functions", mode: "fill",
  title: "Recursive factorial",
  question: "Write a recursive function to calculate the factorial of a number.",
  task: "Write a recursive function <code>fact(n)</code>: it must call itself. Read a number and print its factorial.",
  starter: R`fact <- function(n) {
  if (n <= 1) return(___)
  return(n * fact(___))
}

num <- as.integer(readline("Enter a number: "))
cat("Factorial of", num, "is", fact(num), "\n")
`,
  solution: R`fact <- function(n) {
  if (n <= 1) return(1)
  return(n * fact(n - 1))
}

num <- as.integer(readline("Enter a number: "))
cat("Factorial of", num, "is", fact(num), "\n")
`,
  hints: [
    "The base case stops the recursion. What is 0! or 1!?",
    "Return 1 in the base case, and n * fact(n - 1) otherwise."
  ],
  tests: [
    { check: 'fact(0) == 1 && fact(1) == 1 && fact(5) == 120 && fact(10) == 3628800 && "fact" %in% all.names(body(fact))',
      d: "fact(0)=1, fact(5)=120, fact(10)=3628800, and fact calls itself" },
    { in: ["6"], last: 720, d: "Input 6 prints 720" },
  ] },

// ---------------- SET 4 ----------------
{ id: "s4q1", group: "set", set: 4, q: 1, pattern: "vectors", mode: "fill",
  title: "Student list",
  question: "Create a list containing a student's name, age, marks, and pass status. Display each element.",
  task: "Make a list named <code>student</code> with elements <code>name</code>, <code>age</code>, <code>marks</code> and <code>passed</code>. Print every element.",
  starter: R`student <- list(name = "Anu", age = 19,
                marks = c(82, 76, 91), passed = TRUE)

cat("Name:", student$name, "\n")
cat("Age:", student$___, "\n")
cat("Marks:", student$marks, "\n")
cat("Passed:", student[[___]], "\n")

# Another way: loop over the names of the list
for (item in names(student)) {
  cat(item, ":", format(student[[item]]), "\n")
}
`,
  solution: R`student <- list(name = "Anu", age = 19,
                marks = c(82, 76, 91), passed = TRUE)

cat("Name:", student$name, "\n")
cat("Age:", student$age, "\n")
cat("Marks:", student$marks, "\n")
cat("Passed:", student[["passed"]], "\n")

# Another way: loop over the names of the list
for (item in names(student)) {
  cat(item, ":", format(student[[item]]), "\n")
}
`,
  hints: [
    "Use $ followed by the element name, or [[ ]] with the name in quotes.",
    "student$age and student[[\"passed\"]]"
  ],
  tests: [
    { check: 'is.list(student) && all(c("name","age","marks","passed") %in% names(student))',
      textR: "c(as.character(student$name), as.character(student$passed))",
      numsR: "c(student$age, student$marks)",
      d: "student has name, age, marks and passed, and every value is printed" },
  ] },

{ id: "s4q2", group: "set", set: 4, q: 2, pattern: "dataframes", mode: "fill",
  title: "iris structure and summary",
  question: "Load the built-in iris dataset and display its structure and summary statistics.",
  task: "Load <code>iris</code>. Show its structure with <code>str()</code> and its summary with <code>summary()</code>.",
  starter: R`data(iris)

cat("Structure of iris:\n")
___(iris)

cat("\nSummary statistics:\n")
print(___(iris))
`,
  solution: R`data(iris)

cat("Structure of iris:\n")
str(iris)

cat("\nSummary statistics:\n")
print(summary(iris))
`,
  hints: [
    "str is short for structure.",
    "Use str(iris) and summary(iris)."
  ],
  tests: [
    { text: ["150 obs", "Min.", "5.843", "setosa"], d: "Output shows the structure (150 obs) and the summary (Min., mean 5.843)" },
  ] },

{ id: "s4q3", group: "set", set: 4, q: 3, pattern: "plots", mode: "fill",
  title: "Scatter plot: sepal vs petal length",
  question: "Draw a scatter plot showing the relationship between sepal length and petal length.",
  task: "Use <code>plot()</code> with <code>iris$Sepal.Length</code> on the x-axis and <code>iris$Petal.Length</code> on the y-axis. Add a title and axis labels.",
  starter: R`plot(iris$Sepal.Length, iris$___,
     main = "Sepal length vs petal length",
     xlab = "Sepal length (cm)", ylab = "Petal length (cm)",
     col = iris$Species, pch = 19)

legend("topleft", legend = levels(iris$Species), col = 1:3, pch = 19)
`,
  solution: R`plot(iris$Sepal.Length, iris$Petal.Length,
     main = "Sepal length vs petal length",
     xlab = "Sepal length (cm)", ylab = "Petal length (cm)",
     col = iris$Species, pch = 19)

legend("topleft", legend = levels(iris$Species), col = 1:3, pch = 19)
`,
  hints: [
    "plot(x, y): the first vector goes on the x-axis, the second on the y-axis.",
    "The missing column is Petal.Length. Column names are case-sensitive."
  ],
  tests: [
    { plot: true, use: ["Sepal\\.Length", "Petal\\.Length"], d: "A plot is drawn using Sepal.Length and Petal.Length" },
  ] },

// ---------------- SET 5 ----------------
{ id: "s5q1", group: "set", set: 5, q: 1, pattern: "loops", mode: "fill",
  title: "Sum of first n numbers with while",
  question: "Write an R program using while to calculate the sum of the first n natural numbers.",
  task: "Read <code>n</code>. Use a <code>while</code> loop to add 1 + 2 + ... + n. Print the total at the end.",
  starter: R`n <- as.integer(readline("Enter n: "))
total <- 0
i <- 1

while (i <= ___) {
  total <- total + i
  i <- ___
}

cat("Sum of first", n, "natural numbers is", total, "\n")
`,
  solution: R`n <- as.integer(readline("Enter n: "))
total <- 0
i <- 1

while (i <= n) {
  total <- total + i
  i <- i + 1
}

cat("Sum of first", n, "natural numbers is", total, "\n")
`,
  hints: [
    "The loop should run while i has not passed n. Remember to move i forward, or the loop never ends.",
    "while (i <= n) and i <- i + 1"
  ],
  tests: [
    { in: ["10"], last: 55, use: ["\\bwhile\\s*\\("], d: "Input 10 ends with 55, using while" },
    { in: ["100"], last: 5050, d: "Input 100 ends with 5050" },
  ] },

{ id: "s5q2", group: "set", set: 5, q: 2, pattern: "loops", mode: "fill",
  title: "repeat, break and next",
  question: "Demonstrate repeat, break, and next in a program.",
  task: "Use <code>repeat</code> to count i = 1, 2, 3, ... Skip multiples of 3 with <code>next</code>. Stop with <code>break</code> when i is more than 10. Expected numbers: 1 2 4 5 7 8 10.",
  starter: R`i <- 0
repeat {
  i <- i + 1
  if (i > 10) ___
  if (i %% 3 == 0) ___
  cat(i, "")
}
cat("\nLoop finished\n")
`,
  solution: R`i <- 0
repeat {
  i <- i + 1
  if (i > 10) break
  if (i %% 3 == 0) next
  cat(i, "")
}
cat("\nLoop finished\n")
`,
  hints: [
    "One keyword leaves the loop completely. The other skips to the next round.",
    "if (i > 10) break, and if (i %% 3 == 0) next"
  ],
  tests: [
    { nums: [1, 2, 4, 5, 7, 8, 10], notNums: [3, 6, 9], use: ["\\brepeat\\b", "\\bbreak\\b", "\\bnext\\b"],
      d: "Prints 1 2 4 5 7 8 10, skips 3, 6, 9, and uses repeat, break and next" },
  ] },

{ id: "s5q3", group: "set", set: 5, q: 3, pattern: "dataframes", mode: "fill",
  title: "Save a data frame as CSV and read it back",
  question: "Create a data frame of student details and save it as a CSV file. Read the file back into R.",
  task: "Make a data frame <code>students</code>, save it as <code>student_details.csv</code>, read it back into <code>s2</code> and print it.",
  starter: R`students <- data.frame(
  name  = c("Anu", "Bilal", "Chitra"),
  roll  = c(101, 102, 103),
  marks = c(82, 67, 91)
)

write.csv(students, "student_details.csv", row.names = ___)

s2 <- ___("student_details.csv")
cat("Data read back from the CSV file:\n")
print(s2)
`,
  solution: R`students <- data.frame(
  name  = c("Anu", "Bilal", "Chitra"),
  roll  = c(101, 102, 103),
  marks = c(82, 67, 91)
)

write.csv(students, "student_details.csv", row.names = FALSE)

s2 <- read.csv("student_details.csv")
cat("Data read back from the CSV file:\n")
print(s2)
`,
  hints: [
    "row.names = FALSE stops R from writing an extra column of row numbers. The reading function mirrors write.csv.",
    "write.csv(students, \"student_details.csv\", row.names = FALSE) and s2 <- read.csv(\"student_details.csv\")"
  ],
  tests: [
    { check: 'file.exists("student_details.csv") && is.data.frame(s2) && nrow(s2) == nrow(students) && all(names(students) %in% names(s2))',
      d: "student_details.csv is written, and s2 has the same rows and columns" },
  ] },

// ---------------- SET 6 ----------------
{ id: "s6q1", group: "set", set: 6, q: 1, pattern: "input", mode: "blank",
  title: "Area and circumference of a circle",
  question: "Write an R program to calculate the area and circumference of a circle.",
  task: "Read the radius with <code>readline()</code>. Print the area and the circumference. Use R's built-in <code>pi</code>.",
  solution: R`r <- as.numeric(readline("Enter the radius: "))

area <- pi * r^2
circumference <- 2 * pi * r

cat("Area:", round(area, 2), "\n")
cat("Circumference:", round(circumference, 2), "\n")
`,
  hints: [
    "Area = pi × r². Circumference = 2 × pi × r. Convert the input with as.numeric().",
    "area <- pi * r^2 and circumference <- 2 * pi * r. Print them with cat()."
  ],
  tests: [
    { in: ["7"], nums: [153.93804, 43.982297], d: "Radius 7 gives area 153.94 and circumference 43.98" },
    { in: ["2.5"], nums: [19.634954, 15.707963], d: "Radius 2.5 gives area 19.63 and circumference 15.71" },
  ] },

{ id: "s6q2", group: "set", set: 6, q: 2, pattern: "functions", mode: "blank",
  title: "Sum of vector elements",
  question: "Write a function to find the sum of the elements in a vector.",
  task: "Write <code>vec_sum(v)</code> that adds the elements with a loop. Do not use the built-in <code>sum()</code> inside it. Test it on a vector and print the result.",
  solution: R`vec_sum <- function(v) {
  total <- 0
  for (x in v) {
    total <- total + x
  }
  return(total)
}

nums <- c(4, 8, 15, 16, 23, 42)
cat("Vector:", nums, "\n")
cat("Sum of elements:", vec_sum(nums), "\n")
`,
  hints: [
    "Start a total at 0. Loop through each element and add it to the total.",
    "for (x in v) { total <- total + x } and then return(total)."
  ],
  tests: [
    { check: 'vec_sum(c(1, 2, 3)) == 6 && vec_sum(c(-2.5, 10)) == 7.5 && vec_sum(5) == 5 && !("sum" %in% all.names(body(vec_sum)))',
      d: "vec_sum(c(1,2,3)) = 6, vec_sum(c(-2.5,10)) = 7.5, and sum() is not used inside" },
  ] },

{ id: "s6q3", group: "set", set: 6, q: 3, pattern: "vectors", mode: "blank",
  title: "Range, variance and SD",
  question: "Calculate the range, variance, and standard deviation of a numerical dataset.",
  task: "Store at least 5 numbers in <code>data</code>. Print the range as max − min, the variance and the standard deviation.",
  solution: R`data <- c(23, 45, 12, 67, 34, 89, 21, 56)

r <- range(data)          # gives min and max
cat("Minimum and maximum:", r, "\n")
cat("Range (max - min):", diff(r), "\n")
cat("Variance:", var(data), "\n")
cat("Standard deviation:", sd(data), "\n")
`,
  hints: [
    "range() in R returns two numbers: the min and the max. The statistical range is max − min.",
    "Use max(data) - min(data) (or diff(range(data))), var(data) and sd(data)."
  ],
  tests: [
    { check: "is.numeric(data) && length(data) >= 5", numsR: "c(max(data) - min(data), var(data), sd(data))",
      d: "max − min, variance and SD of data are printed" },
  ] },

// ---------------- SET 7 ----------------
{ id: "s7q1", group: "set", set: 7, q: 1, pattern: "input", mode: "blank",
  title: "Grades from marks",
  question: "Write an R program to assign grades based on marks using conditional statements.",
  task: "Read marks (0–100) and print the grade. Use this scale: 90+ <b>O</b>, 80–89 <b>A</b>, 70–79 <b>B</b>, 60–69 <b>C</b>, 50–59 <b>D</b>, below 50 <b>F</b>. Print the grade letter on its own, like <code>Grade: A</code>.",
  solution: R`marks <- as.numeric(readline("Enter marks (0-100): "))

if (marks >= 90) {
  grade <- "O"
} else if (marks >= 80) {
  grade <- "A"
} else if (marks >= 70) {
  grade <- "B"
} else if (marks >= 60) {
  grade <- "C"
} else if (marks >= 50) {
  grade <- "D"
} else {
  grade <- "F"
}

cat("Grade:", grade, "\n")
`,
  hints: [
    "Check from the highest grade down, using if ... else if ... else.",
    "Start with if (marks >= 90). Each else if only runs when the earlier checks failed, so 85 stops at >= 80."
  ],
  tests: [
    { in: ["95"], tok: ["O"], notTok: ["A", "B", "C", "D", "F"], d: "95 gives O" },
    { in: ["80"], tok: ["A"], notTok: ["O", "B", "C", "D", "F"], d: "80 gives A (boundary)" },
    { in: ["79"], tok: ["B"], notTok: ["O", "A", "C", "D", "F"], d: "79 gives B" },
    { in: ["64"], tok: ["C"], notTok: ["O", "A", "B", "D", "F"], d: "64 gives C" },
    { in: ["50"], tok: ["D"], notTok: ["O", "A", "B", "C", "F"], d: "50 gives D (boundary)" },
    { in: ["30"], tok: ["F"], notTok: ["O", "A", "B", "C", "D"], d: "30 gives F" },
  ] },

{ id: "s7q2", group: "set", set: 7, q: 2, pattern: "input", mode: "blank",
  title: "Largest of three numbers",
  question: "Write an R program to find the largest of three numbers using if...else.",
  task: "Read three numbers. Use <code>if ... else</code> (not <code>max()</code>) to find the largest. Print it as the last number in your output.",
  solution: R`x <- as.numeric(readline("Enter first number: "))
y <- as.numeric(readline("Enter second number: "))
z <- as.numeric(readline("Enter third number: "))

if (x >= y && x >= z) {
  largest <- x
} else if (y >= z) {
  largest <- y
} else {
  largest <- z
}

cat("The largest number is", largest, "\n")
`,
  hints: [
    "First test if the first number is at least as big as both others. Use && to join two conditions.",
    "if (x >= y && x >= z) ... else if (y >= z) ... else ... Avoid naming a variable c, because c() is a function."
  ],
  tests: [
    { in: ["4", "9", "2"], last: 9, use: ["\\bif\\b", "\\belse\\b"], d: "4, 9, 2 gives 9" },
    { in: ["15", "3", "15"], last: 15, d: "15, 3, 15 gives 15 (a tie)" },
    { in: ["-1", "-5", "-3"], last: -1, d: "-1, -5, -3 gives -1" },
    { in: ["2", "3", "8"], last: 8, d: "2, 3, 8 gives 8" },
  ] },

{ id: "s7q3", group: "set", set: 7, q: 3, pattern: "dataframes", mode: "blank",
  title: "Read a CSV: first five rows and summary",
  question: "Read a CSV file containing student details and display the first five records and summary statistics.",
  task: "This site puts a sample file <code>class_marks.csv</code> (8 students) in R's working folder. Read it, print the first five records with <code>head()</code>, then print <code>summary()</code>. In RStudio, use your own CSV file.",
  solution: R`df <- read.csv("class_marks.csv")

cat("First five records:\n")
print(head(df, 5))

cat("\nSummary statistics:\n")
print(summary(df))
`,
  hints: [
    "read.csv() reads the file into a data frame. head(df, 5) gives the first five rows.",
    "df <- read.csv(\"class_marks.csv\"); print(head(df, 5)); print(summary(df))"
  ],
  tests: [
    { text: ["Min.", "Anu", "Bilal", "Chitra", "Devan", "Esha"], notText: ["Farhan", "Gopika", "Hari"],
      numsR: 'mean(read.csv("class_marks.csv")$marks)',
      d: "Only the first five students are listed, and the summary (Min., mean 72.38) is shown" },
  ] },

// ---------------- SET 8 ----------------
{ id: "s8q1", group: "set", set: 8, q: 1, pattern: "functions", mode: "blank",
  title: "Recursive Fibonacci",
  question: "Write a recursive function to calculate a specified Fibonacci number.",
  task: "Write a recursive <code>fib(n)</code> with fib(0) = 0 and fib(1) = 1. Read n and print fib(n) as the last number.",
  solution: R`fib <- function(n) {
  if (n <= 1) return(n)
  return(fib(n - 1) + fib(n - 2))
}

n <- as.integer(readline("Which Fibonacci number? n = "))
cat("Fibonacci number", n, "is", fib(n), "\n")
`,
  hints: [
    "Base case: for n = 0 or n = 1, return n itself.",
    "Otherwise return fib(n - 1) + fib(n - 2)."
  ],
  tests: [
    { check: 'fib(0) == 0 && fib(1) == 1 && fib(2) == 1 && fib(10) == 55 && "fib" %in% all.names(body(fib))',
      d: "fib(0)=0, fib(1)=1, fib(10)=55, and fib calls itself" },
    { in: ["10"], last: 55, d: "Input 10 prints 55" },
    { in: ["15"], last: 610, d: "Input 15 prints 610" },
  ] },

{ id: "s8q2", group: "set", set: 8, q: 2, pattern: "loops", mode: "blank",
  title: "Multiplication table with while",
  question: "Write an R program to generate a multiplication table using a while loop.",
  task: "Read a number. Use a <code>while</code> loop to print n x 1 up to n x 10.",
  solution: R`n <- as.integer(readline("Enter a number: "))
i <- 1

while (i <= 10) {
  cat(n, "x", i, "=", n * i, "\n")
  i <- i + 1
}
`,
  hints: [
    "Start a counter at 1. Keep looping while the counter is 10 or less.",
    "Inside the loop, print n * i and then increase i by 1."
  ],
  tests: [
    { in: ["6"], nums: [12, 18, 24, 30, 36, 42, 48, 54, 60], use: ["\\bwhile\\s*\\("], d: "Input 6 prints 6 ... 60 using while" },
    { in: ["11"], nums: [22, 33, 44, 55, 66, 77, 88, 99, 110], d: "Input 11 prints 11 ... 110" },
  ] },

{ id: "s8q3", group: "set", set: 8, q: 3, pattern: "dataframes", mode: "blank",
  title: "CSV round trip and filter",
  question: "Write a data frame to a CSV file, read it back, and filter observations using a condition.",
  task: "Make a data frame <code>emp</code> with <code>name</code>, <code>dept</code> and <code>salary</code>. Write it to <code>employees.csv</code>, read it into <code>emp2</code>, and store rows with salary above 30000 in <code>high</code>. Include at least one salary of 30000 or less.",
  solution: R`emp <- data.frame(
  name   = c("Arun", "Beena", "Chris", "Divya", "Elias"),
  dept   = c("HR", "IT", "IT", "Sales", "HR"),
  salary = c(28000, 45000, 52000, 31000, 26000)
)

write.csv(emp, "employees.csv", row.names = FALSE)
emp2 <- read.csv("employees.csv")

high <- emp2[emp2$salary > 30000, ]
cat("Employees earning more than 30000:\n")
print(high)
`,
  hints: [
    "Three steps: write.csv(), read.csv(), then pick rows with df[condition, ].",
    "high <- emp2[emp2$salary > 30000, ] (or subset(emp2, salary > 30000))."
  ],
  tests: [
    { check: 'file.exists("employees.csv") && is.data.frame(emp2) && is.data.frame(high) && all(high$salary > 30000) && nrow(high) == sum(emp2$salary > 30000) && nrow(high) < nrow(emp2)',
      d: "employees.csv is written and read back, and high holds only salaries above 30000" },
  ] },

// ---------------- SET 9 ----------------
{ id: "s9q1", group: "set", set: 9, q: 1, pattern: "input", mode: "blank",
  title: "Even/odd and positive/negative",
  question: "Write an R program to check whether a number is even or odd and whether it is positive or negative.",
  task: "Read an integer. Print whether it is <em>even</em> or <em>odd</em>, and whether it is <em>positive</em>, <em>negative</em> or <em>zero</em>.",
  solution: R`n <- as.integer(readline("Enter an integer: "))

if (n %% 2 == 0) {
  cat(n, "is even\n")
} else {
  cat(n, "is odd\n")
}

if (n > 0) {
  cat(n, "is positive\n")
} else if (n < 0) {
  cat(n, "is negative\n")
} else {
  cat(n, "is zero\n")
}
`,
  hints: [
    "Use two separate if blocks: one for even/odd, one for the sign.",
    "n %% 2 == 0 means even. For the sign, check n > 0, then n < 0, else zero."
  ],
  tests: [
    { in: ["7"], text: ["odd", "positive"], notText: ["even", "negative"], d: "7 is odd and positive" },
    { in: ["-4"], text: ["even", "negative"], notText: ["odd", "positive"], d: "-4 is even and negative" },
    { in: ["0"], text: ["even", "zero"], d: "0 is even and zero" },
    { in: ["-9"], text: ["odd", "negative"], notText: ["even"], d: "-9 is odd and negative" },
  ] },

{ id: "s9q2", group: "set", set: 9, q: 2, pattern: "functions", mode: "blank",
  title: "Factorial with a loop",
  question: "Write a function to calculate the factorial of a non-negative integer using iteration.",
  task: "Write <code>fact_iter(n)</code> using a loop. Do not use recursion, <code>factorial()</code> or <code>prod()</code>. Read a number and print its factorial as the last number.",
  solution: R`fact_iter <- function(n) {
  result <- 1
  if (n > 0) {
    for (i in 1:n) {
      result <- result * i
    }
  }
  return(result)
}

num <- as.integer(readline("Enter a non-negative integer: "))
if (num < 0) {
  cat("Factorial is not defined for negative numbers\n")
} else {
  cat("Factorial of", num, "is", fact_iter(num), "\n")
}
`,
  hints: [
    "Start result at 1 and multiply it by each number from 1 to n.",
    "Guard n = 0: in R, 1:0 is c(1, 0), so wrap the loop in if (n > 0)."
  ],
  tests: [
    { check: 'fact_iter(0) == 1 && fact_iter(1) == 1 && fact_iter(5) == 120 && fact_iter(10) == 3628800 && !any(c("fact_iter", "factorial", "prod") %in% all.names(body(fact_iter)))',
      d: "fact_iter(0)=1, fact_iter(5)=120, with a loop only" },
    { in: ["5"], last: 120, d: "Input 5 prints 120" },
    { in: ["0"], last: 1, d: "Input 0 prints 1" },
  ] },

{ id: "s9q3", group: "set", set: 9, q: 3, pattern: "dataframes", mode: "blank",
  title: "Factor and frequency table",
  question: "Create a data frame, convert a categorical column to a factor, and display its frequency table.",
  task: "Make a data frame <code>staff</code> with a column <code>dept</code>. Convert <code>dept</code> to a factor. Store <code>table(staff$dept)</code> in <code>freq</code> and print it.",
  solution: R`staff <- data.frame(
  name = c("Arun", "Beena", "Chris", "Divya", "Elias", "Fathima"),
  dept = c("IT", "HR", "IT", "Sales", "IT", "HR")
)

staff$dept <- factor(staff$dept)
cat("Levels:", levels(staff$dept), "\n")

freq <- table(staff$dept)
print(freq)
`,
  hints: [
    "factor() converts text to categories. Assign it back to the same column.",
    "staff$dept <- factor(staff$dept), then freq <- table(staff$dept)."
  ],
  tests: [
    { check: "is.factor(staff$dept) && nlevels(staff$dept) >= 2 && all(as.vector(freq) == as.vector(table(staff$dept)))",
      textR: "levels(staff$dept)",
      d: "dept is a factor, and freq matches its frequency table" },
  ] },

// ---------------- SET 10 ----------------
{ id: "s10q1", group: "set", set: 10, q: 1, pattern: "input", mode: "blank",
  title: "Total, average and grade",
  question: "Write an R program using user input, variables, and conditional statements to calculate a student's total, average, and grade.",
  task: "Read a name and marks in 3 subjects (4 lines of input). Print the name, total, average and grade using the average: 90+ O, 80–89 A, 70–79 B, 60–69 C, 50–59 D, below 50 F.",
  solution: R`name <- readline("Enter student name: ")
m1 <- as.numeric(readline("Marks in subject 1: "))
m2 <- as.numeric(readline("Marks in subject 2: "))
m3 <- as.numeric(readline("Marks in subject 3: "))

total <- m1 + m2 + m3
average <- total / 3

if (average >= 90) {
  grade <- "O"
} else if (average >= 80) {
  grade <- "A"
} else if (average >= 70) {
  grade <- "B"
} else if (average >= 60) {
  grade <- "C"
} else if (average >= 50) {
  grade <- "D"
} else {
  grade <- "F"
}

cat("Student:", name, "\n")
cat("Total:", total, "\n")
cat("Average:", round(average, 2), "\n")
cat("Grade:", grade, "\n")
`,
  hints: [
    "The name stays as text, so do not use as.numeric() on it. Convert only the marks.",
    "total <- m1 + m2 + m3; average <- total / 3; then the same if ... else if ladder as the grade question."
  ],
  tests: [
    { in: ["Anu", "80", "90", "70"], text: ["Anu"], nums: [240, 80], tok: ["A"], notTok: ["O", "B", "F"], d: "Anu 80, 90, 70: total 240, average 80, grade A" },
    { in: ["Ravi", "45", "50", "40"], text: ["Ravi"], nums: [135, 45], tok: ["F"], notTok: ["O", "A", "B"], d: "Ravi 45, 50, 40: total 135, average 45, grade F" },
    { in: ["Meera", "95", "92", "98"], nums: [285, 95], tok: ["O"], notTok: ["A", "F"], d: "Meera 95, 92, 98: total 285, average 95, grade O" },
  ] },

{ id: "s10q2", group: "set", set: 10, q: 2, pattern: "functions", mode: "blank",
  title: "Recursive sum of digits",
  question: "Write a recursive function to calculate the sum of the digits of a positive integer.",
  task: "Write a recursive <code>digit_sum(n)</code>. Read a number and print the digit sum as the last number.",
  solution: R`digit_sum <- function(n) {
  if (n < 10) return(n)
  return((n %% 10) + digit_sum(n %/% 10))
}

num <- as.integer(readline("Enter a positive integer: "))
cat("Sum of digits of", num, "is", digit_sum(num), "\n")
`,
  hints: [
    "n %% 10 gives the last digit. n %/% 10 removes the last digit.",
    "Base case: a single digit (n < 10) returns n. Otherwise last digit + digit_sum(n %/% 10)."
  ],
  tests: [
    { check: 'digit_sum(1234) == 10 && digit_sum(7) == 7 && digit_sum(1005) == 6 && digit_sum(99999) == 45 && "digit_sum" %in% all.names(body(digit_sum))',
      d: "digit_sum(1234)=10, digit_sum(1005)=6, and it calls itself" },
    { in: ["4567"], last: 22, d: "Input 4567 prints 22" },
  ] },

{ id: "s10q3", group: "set", set: 10, q: 3, pattern: "dataframes", mode: "blank",
  title: "CSV round trip with summary",
  question: "Create a data frame, save it to CSV, read it back, and calculate its summary statistics.",
  task: "Make a data frame <code>products</code> with at least one numeric column. Save it as <code>products.csv</code>, read it into <code>p2</code>, and print <code>summary(p2)</code>.",
  solution: R`products <- data.frame(
  item  = c("Pen", "Notebook", "Bag", "Calculator", "Ruler"),
  price = c(10, 45, 650, 899, 15),
  qty   = c(120, 60, 8, 5, 75)
)

write.csv(products, "products.csv", row.names = FALSE)
p2 <- read.csv("products.csv")
print(p2)

cat("\nSummary statistics:\n")
print(summary(p2))
`,
  hints: [
    "This is write.csv(), then read.csv(), then summary().",
    "write.csv(products, \"products.csv\", row.names = FALSE); p2 <- read.csv(\"products.csv\"); print(summary(p2))"
  ],
  tests: [
    { check: 'file.exists("products.csv") && is.data.frame(p2) && nrow(p2) == nrow(products) && any(sapply(p2, is.numeric))',
      text: ["Min.", "Max."], numsR: "v <- Filter(is.numeric, p2)[[1]]; c(mean(v), median(v))",
      d: "products.csv is written and read back, and summary(p2) is printed" },
  ] },

// ---------------- PRACTICE VARIATIONS ----------------
{ id: "v1", group: "var", vn: 1, pattern: "dataframes", mode: "blank",
  title: "CSV → filter → sort",
  question: "Save a students data frame to marks.csv. Read it back, keep students with marks of 60 or more, and sort them from highest to lowest marks.",
  task: "Write the data frame to <code>marks.csv</code>. Read it back, filter marks ≥ 60, sort in decreasing order of marks, and store the result in <code>result</code>. Include at least one student below 60.",
  solution: R`students <- data.frame(
  name  = c("Anu", "Bilal", "Chitra", "Devan", "Esha", "Farhan"),
  marks = c(72, 45, 91, 60, 58, 84)
)
write.csv(students, "marks.csv", row.names = FALSE)

s <- read.csv("marks.csv")
passed <- s[s$marks >= 60, ]
result <- passed[order(passed$marks, decreasing = TRUE), ]

cat("Students with 60 or more, highest first:\n")
print(result)
`,
  hints: [
    "Do it in order: write.csv, read.csv, filter rows, then sort with order().",
    "order(passed$marks, decreasing = TRUE) gives the row order. Use it inside [ , ]."
  ],
  tests: [
    { check: 'file.exists("marks.csv") && is.data.frame(result) && all(result$marks >= 60) && nrow(result) == sum(read.csv("marks.csv")$marks >= 60) && nrow(result) < nrow(read.csv("marks.csv")) && all(diff(result$marks) <= 0)',
      textR: "as.character(result[[1]])",
      d: "result has only marks ≥ 60, sorted highest first, read from marks.csv" },
  ] },

{ id: "v2", group: "var", vn: 2, pattern: "functions", mode: "blank",
  title: "Prime check → first n primes",
  question: "Use your is_prime() function to print the first n prime numbers.",
  task: "Write <code>is_prime(n)</code>. Read <code>n</code>. Use a <code>while</code> loop to print the first n primes.",
  solution: R`is_prime <- function(n) {
  if (n < 2) return(FALSE)
  if (n < 4) return(TRUE)
  for (i in 2:floor(sqrt(n))) {
    if (n %% i == 0) return(FALSE)
  }
  TRUE
}

n <- as.integer(readline("How many primes? "))
count <- 0
num <- 2
while (count < n) {
  if (is_prime(num)) {
    cat(num, "")
    count <- count + 1
  }
  num <- num + 1
}
cat("\n")
`,
  hints: [
    "You don't know in advance how far to search, so use while with a counter of primes found.",
    "Keep num going up by 1. When is_prime(num) is TRUE, print it and add 1 to count."
  ],
  tests: [
    { check: "is_prime(2) && is_prime(97) && !is_prime(1) && !is_prime(91)", d: "is_prime() works" },
    { in: ["5"], nums: [2, 3, 5, 7, 11], notNums: [13, 4, 9], d: "n = 5 prints 2 3 5 7 11 only" },
    { in: ["10"], nums: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29], notNums: [31, 4, 9, 15, 21, 25, 27], d: "n = 10 prints up to 29" },
  ] },

{ id: "v3", group: "var", vn: 3, pattern: "functions", mode: "blank",
  title: "Factorial → nCr",
  question: "Use a factorial function to compute nCr = n! / (r! (n − r)!).",
  task: "Write <code>fact(n)</code> and <code>ncr(n, r)</code> (don't use <code>choose()</code>). Read n and r and print nCr as the last number.",
  solution: R`fact <- function(n) {
  if (n <= 1) return(1)
  n * fact(n - 1)
}

ncr <- function(n, r) {
  fact(n) / (fact(r) * fact(n - r))
}

n <- as.integer(readline("Enter n: "))
r <- as.integer(readline("Enter r: "))
if (r < 0 || r > n) {
  cat("r must be between 0 and n\n")
} else {
  cat("nCr =", ncr(n, r), "\n")
}
`,
  hints: [
    "Reuse your factorial function three times: for n, r and n − r.",
    "ncr <- function(n, r) fact(n) / (fact(r) * fact(n - r))"
  ],
  tests: [
    { check: 'ncr(5, 2) == 10 && ncr(10, 3) == 120 && ncr(6, 0) == 1 && ncr(7, 7) == 1 && !("choose" %in% all.names(body(ncr)))',
      d: "ncr(5,2)=10, ncr(10,3)=120, ncr(6,0)=1" },
    { in: ["5", "2"], last: 10, d: "n = 5, r = 2 prints 10" },
    { in: ["8", "3"], last: 56, d: "n = 8, r = 3 prints 56" },
  ] },

{ id: "v4", group: "var", vn: 4, pattern: "loops", mode: "blank",
  title: "Table that skips with next",
  question: "Print the multiplication table of n from 1 to 10, but skip the rows where the multiplier is a multiple of 3.",
  task: "Read n. Use a <code>for</code> loop with <code>next</code> to skip i = 3, 6, 9.",
  solution: R`n <- as.integer(readline("Enter a number: "))

for (i in 1:10) {
  if (i %% 3 == 0) next
  cat(n, "x", i, "=", n * i, "\n")
}
`,
  hints: [
    "Put the skip check at the top of the loop body, before cat().",
    "if (i %% 3 == 0) next"
  ],
  tests: [
    { in: ["4"], nums: [8, 16, 20, 28, 32, 40], notNums: [12, 24, 36], use: ["\\bnext\\b"], d: "n = 4 prints 4, 8, 16 ... but not 12, 24, 36" },
    { in: ["7"], nums: [14, 28, 35, 49, 56, 70], notNums: [21, 42, 63], d: "n = 7 skips 21, 42, 63" },
  ] },

{ id: "v5", group: "var", vn: 5, pattern: "loops", mode: "blank",
  title: "Fibonacci series with a loop",
  question: "Print the first n terms of the Fibonacci series (0, 1, 1, 2, ...) using a loop instead of recursion.",
  task: "Read n. Keep two variables for the last two terms and update them in a <code>for</code> loop.",
  solution: R`n <- as.integer(readline("How many terms? "))
a <- 0
b <- 1
for (i in 1:n) {
  cat(a, "")
  nxt <- a + b
  a <- b
  b <- nxt
}
cat("\n")
`,
  hints: [
    "Start with a = 0 and b = 1. Print a each time.",
    "The next term is a + b. Then shift: a becomes b, b becomes the next term."
  ],
  tests: [
    { in: ["8"], nums: [0, 1, 2, 3, 5, 8, 13], notNums: [21], d: "n = 8 prints 0 1 1 2 3 5 8 13" },
    { in: ["12"], nums: [21, 34, 55, 89], notNums: [144], d: "n = 12 ends at 89" },
  ] },

{ id: "v6", group: "var", vn: 6, pattern: "dataframes", mode: "blank",
  title: "Grade function on a data frame",
  question: "Write a grade() function and use it to add a grade column to a students data frame. Show how many students got each grade.",
  task: "Write <code>grade(m)</code> (90+ O, 80+ A, 70+ B, 60+ C, 50+ D, else F). Add <code>students$grade</code> using <code>sapply()</code>, then print <code>table(students$grade)</code>.",
  solution: R`grade <- function(m) {
  if (m >= 90) "O"
  else if (m >= 80) "A"
  else if (m >= 70) "B"
  else if (m >= 60) "C"
  else if (m >= 50) "D"
  else "F"
}

students <- data.frame(
  name  = c("Anu", "Bilal", "Chitra", "Devan", "Esha", "Farhan"),
  marks = c(95, 82, 74, 66, 51, 38)
)
students$grade <- sapply(students$marks, grade)
print(students)

cat("\nNumber of students per grade:\n")
print(table(students$grade))
`,
  hints: [
    "grade() works on one number, so apply it to each mark with sapply().",
    "students$grade <- sapply(students$marks, grade)"
  ],
  tests: [
    { check: 'grade(95) == "O" && grade(80) == "A" && grade(79) == "B" && grade(60) == "C" && grade(50) == "D" && grade(49) == "F" && "grade" %in% names(students) && all(students$grade == sapply(students$marks, grade))',
      d: "grade() follows the scale, and students$grade matches it" },
  ] },

{ id: "v7", group: "var", vn: 7, pattern: "loops", mode: "blank",
  title: "Palindrome number",
  question: "Write a function that reverses the digits of a number using a while loop, and use it to check whether a number is a palindrome.",
  task: "Write <code>rev_num(n)</code> using <code>%%</code> and <code>%/%</code>. Read a number and print whether it is a palindrome. For a non-palindrome, include the word <em>not</em>.",
  solution: R`rev_num <- function(n) {
  r <- 0
  while (n > 0) {
    r <- r * 10 + n %% 10
    n <- n %/% 10
  }
  r
}

num <- as.integer(readline("Enter a number: "))
if (rev_num(num) == num) {
  cat(num, "is a palindrome\n")
} else {
  cat(num, "is not a palindrome\n")
}
`,
  hints: [
    "Take the last digit with n %% 10 and add it to r × 10. Then drop it with n %/% 10.",
    "while (n > 0) { r <- r * 10 + n %% 10; n <- n %/% 10 }"
  ],
  tests: [
    { check: "rev_num(1234) == 4321 && rev_num(121) == 121 && rev_num(5) == 5", d: "rev_num(1234) = 4321" },
    { in: ["1221"], text: ["palindrome"], notText: ["not"], d: "1221 is a palindrome" },
    { in: ["123"], text: ["not"], d: "123 is not a palindrome" },
  ] },

{ id: "v8", group: "var", vn: 8, pattern: "vectors", mode: "blank",
  title: "Matrix multiplication with loops",
  question: "Multiply two matrices using nested loops. Stop with an error if they cannot be multiplied, and compare with %*%.",
  task: "Write <code>mat_mult(A, B)</code> with three nested <code>for</code> loops (no <code>%*%</code> inside). Call <code>stop()</code> when <code>ncol(A) != nrow(B)</code>.",
  solution: R`mat_mult <- function(A, B) {
  if (ncol(A) != nrow(B)) stop("Columns of A must equal rows of B")
  C <- matrix(0, nrow = nrow(A), ncol = ncol(B))
  for (i in 1:nrow(A)) {
    for (j in 1:ncol(B)) {
      for (k in 1:ncol(A)) {
        C[i, j] <- C[i, j] + A[i, k] * B[k, j]
      }
    }
  }
  C
}

A <- matrix(1:6, nrow = 2)    # 2 x 3
B <- matrix(7:12, nrow = 3)   # 3 x 2
C <- mat_mult(A, B)
print(C)
cat("Same as A %*% B?", all(C == A %*% B), "\n")
`,
  hints: [
    "The answer has nrow(A) rows and ncol(B) columns. Each cell is a sum over k.",
    "C[i, j] <- C[i, j] + A[i, k] * B[k, j] inside loops over i, j and k."
  ],
  tests: [
    { check: 'P <- matrix(c(2, 0, 1, 3, -1, 4), nrow = 2); Q <- matrix(1:9, nrow = 3); isTRUE(all.equal(mat_mult(P, Q), P %*% Q, check.attributes = FALSE)) && !("%*%" %in% all.names(body(mat_mult))) && inherits(tryCatch(mat_mult(Q, P), error = function(e) e), "error")',
      d: "mat_mult gives the same answer as %*% and stops for wrong sizes" },
  ] },

{ id: "v9", group: "var", vn: 9, pattern: "plots", mode: "blank",
  title: "Histogram and box plot together",
  question: "Draw a histogram and a box plot of 20 marks side by side, and print the five-number summary.",
  task: "Store at least 10 marks in <code>marks</code>. Use <code>par(mfrow = c(1, 2))</code>, then <code>hist()</code> and <code>boxplot()</code>. Print <code>fivenum(marks)</code>.",
  solution: R`marks <- c(45, 52, 58, 61, 63, 66, 68, 70, 71, 73,
           75, 76, 78, 80, 82, 85, 88, 90, 94, 98)

par(mfrow = c(1, 2))
hist(marks, main = "Histogram of marks", xlab = "Marks", col = "lightblue")
boxplot(marks, main = "Box plot of marks", ylab = "Marks", col = "lightgreen")
par(mfrow = c(1, 1))

cat("Five-number summary (min, Q1, median, Q3, max):\n")
print(fivenum(marks))
`,
  hints: [
    "par(mfrow = c(1, 2)) splits the plot area into 1 row and 2 columns.",
    "hist(marks, ...) then boxplot(marks, ...), then print(fivenum(marks))."
  ],
  tests: [
    { check: "length(marks) >= 10", plot: true, numsR: "fivenum(marks)", use: ["hist\\s*\\(", "boxplot\\s*\\("],
      d: "Both plots are drawn and the five-number summary is printed" },
  ] },

{ id: "v10", group: "var", vn: 10, pattern: "plots", mode: "blank",
  title: "Correlation, covariance and scatter plot",
  question: "For study hours and exam scores, find the covariance and correlation, say if the relationship is positive or negative, and draw a scatter plot with a trend line.",
  task: "Use vectors <code>hours</code> and <code>score</code>. Print <code>cov()</code> and <code>cor()</code> (keep at least 3 decimals), the word positive or negative, and draw the plot.",
  solution: R`hours <- c(2, 3, 5, 1, 4, 6, 7, 3)
score <- c(55, 60, 75, 45, 68, 80, 88, 62)

cat("Covariance:", cov(hours, score), "\n")
r <- cor(hours, score)
cat("Correlation:", r, "\n")
if (r > 0) {
  cat("This is a positive relationship\n")
} else {
  cat("This is a negative relationship\n")
}

plot(hours, score, pch = 19, col = "darkblue",
     main = "Study hours vs score", xlab = "Hours", ylab = "Score")
abline(lm(score ~ hours), col = "red")
`,
  hints: [
    "cov(x, y) and cor(x, y) take the two vectors. The sign of cor tells the direction.",
    "plot(hours, score) draws the points. abline(lm(score ~ hours)) adds the trend line."
  ],
  tests: [
    { numsR: "c(cov(hours, score), cor(hours, score))", textR: 'if (cor(hours, score) > 0) "positive" else "negative"', plot: true,
      d: "Covariance and correlation are printed, the direction is named, and a plot is drawn" },
  ] },

{ id: "v11", group: "var", vn: 11, pattern: "vectors", mode: "blank",
  title: "Exactly, at most, at least",
  question: "Binomial (n = 10, p = 0.5): P(X = 3), P(X ≤ 3), P(X ≥ 3). Poisson (λ = 2): P(X = 0), P(X ≤ 2), P(X ≥ 1). Normal (mean 60, sd 10): P(X ≤ 75), P(X ≥ 50).",
  task: "Print all eight probabilities with <code>cat()</code>. Keep at least 4 decimals. See Learn → Lab record extension for the rules.",
  solution: R`# Binomial: n = 10 trials, p = 0.5
cat("Binomial P(X = 3): ", dbinom(3, size = 10, prob = 0.5), "\n")
cat("Binomial P(X <= 3):", pbinom(3, size = 10, prob = 0.5), "\n")
cat("Binomial P(X >= 3):", 1 - pbinom(2, size = 10, prob = 0.5), "\n")

# Poisson: lambda = 2
cat("Poisson P(X = 0): ", dpois(0, lambda = 2), "\n")
cat("Poisson P(X <= 2):", ppois(2, lambda = 2), "\n")
cat("Poisson P(X >= 1):", 1 - ppois(0, lambda = 2), "\n")

# Normal: mean 60, sd 10
cat("Normal P(X <= 75):", pnorm(75, mean = 60, sd = 10), "\n")
cat("Normal P(X >= 50):", 1 - pnorm(50, mean = 60, sd = 10), "\n")
`,
  hints: [
    "Exactly → d...(). At most → p...(). At least k → 1 − p...(k − 1) for counts.",
    "For the normal, at least x is 1 - pnorm(x, mean, sd). No minus-one step for continuous data."
  ],
  tests: [
    { nums: [0.1171875, 0.171875, 0.9453125, 0.1353353, 0.6766764, 0.8646647, 0.9331928, 0.8413447],
      d: "All eight probabilities are printed: 0.1172, 0.1719, 0.9453, 0.1353, 0.6767, 0.8647, 0.9332, 0.8413" },
  ] },

{ id: "v12", group: "var", vn: 12, pattern: "loops", mode: "blank",
  title: "Read n numbers into a vector",
  question: "Read how many numbers there are, then read each number in a loop into a vector. Print the largest, smallest and mean.",
  task: "First input line is n. The next n lines are the numbers. Store them in a vector and print max, min and mean.",
  solution: R`n <- as.integer(readline("How many numbers? "))
v <- numeric(n)
for (i in 1:n) {
  v[i] <- as.numeric(readline(paste("Number", i, ": ")))
}

cat("Numbers:", v, "\n")
cat("Largest:", max(v), "\n")
cat("Smallest:", min(v), "\n")
cat("Mean:", mean(v), "\n")
`,
  hints: [
    "numeric(n) makes an empty vector of length n. Fill v[i] inside a for loop.",
    "v[i] <- as.numeric(readline(...)), then max(v), min(v), mean(v)."
  ],
  tests: [
    { in: ["4", "3", "8", "1", "6"], nums: [8, 1, 4.5], d: "Numbers 3, 8, 1, 6 give max 8, min 1, mean 4.5" },
    { in: ["3", "10", "-2", "7"], nums: [10, -2, 5], d: "Numbers 10, -2, 7 give max 10, min -2, mean 5" },
  ] },
];

// ---------------- LEARN ----------------
const LEARN = [
{ key: "input",
  idea: "Read values with readline(), convert them to numbers, then choose what to print with if / else if / else.",
  steps: ["Read each value with readline() and convert it with as.numeric() or as.integer().",
          "Test conditions from the most specific to the most general with if, else if, else.",
          "Print the result with cat(), ending the line with \"\\n\"."],
  template: R`n <- as.numeric(readline("Enter a number: "))

if (n > 0) {
  cat(n, "is positive\n")
} else if (n < 0) {
  cat(n, "is negative\n")
} else {
  cat("The number is zero\n")
}
`,
  input: "-8",
  expected: "Enter a number: -8\n-8 is negative",
  mistake: "Forgetting as.numeric(). readline() returns text, so \"10\" > \"9\" is FALSE because text is compared letter by letter.",
  worked: { q: "Read a year and say whether it is a leap year.",
    code: R`year <- as.integer(readline("Enter a year: "))

if ((year %% 4 == 0 && year %% 100 != 0) || year %% 400 == 0) {
  cat(year, "is a leap year\n")
} else {
  cat(year, "is not a leap year\n")
}
`, input: "2024",
    explain: "A year is a leap year if it divides by 4 but not by 100, or if it divides by 400. && means both must be true; || means either one." },
  similar: { text: "Read an integer and print whether it is even or odd, and positive, negative or zero.", ex: "s9q1" } },

{ key: "loops",
  idea: "Repeat a block: for when you know how many times, while when you repeat until a condition fails, repeat with break when you decide inside.",
  steps: ["Decide the loop type: a known count uses for (i in 1:n); otherwise use while.",
          "Inside the loop, do one step of the work, such as adding to a total or printing a line.",
          "With while, change the loop variable every round so the condition finally becomes FALSE."],
  template: R`n <- as.integer(readline("How many squares? "))

for (i in 1:n) {
  cat(i, "squared is", i^2, "\n")
}
`,
  input: "4",
  expected: "How many squares? 4\n1 squared is 1\n2 squared is 4\n3 squared is 9\n4 squared is 16",
  mistake: "Forgetting i <- i + 1 in a while loop. The condition never changes and the loop runs forever. Press Stop if that happens.",
  worked: { q: "Count down from n to 1 using while, then print \"Lift off\".",
    code: R`n <- as.integer(readline("Start from: "))

while (n >= 1) {
  cat(n, "")
  n <- n - 1          # move towards the stop condition
}
cat("\nLift off\n")
`, input: "5",
    explain: "The condition n >= 1 is checked before every round. Each round prints n and makes it smaller, so the loop ends after n reaches 0." },
  similar: { text: "Print the multiplication table of a number using a for loop.", ex: "s2q3" } },

{ key: "functions",
  idea: "Package a calculation as name <- function(inputs) { ... } and return the answer. A recursive function calls itself on a smaller input.",
  steps: ["Write the function header with the inputs it needs.",
          "For recursion, write the base case first (the smallest input you can answer directly).",
          "Write the general case so that it calls the function on a smaller input, and return the result."],
  template: R`square <- function(x) {
  return(x * x)
}

print(square(7))
`,
  input: "",
  expected: "[1] 49",
  mistake: "A recursive function with no base case, or one that never reaches it. R stops with \"evaluation nested too deeply: infinite recursion\".",
  worked: { q: "Write a recursive power(base, e) that computes base^e for e ≥ 0 without using ^.",
    code: R`power <- function(base, e) {
  if (e == 0) return(1)            # base case
  return(base * power(base, e - 1))  # smaller problem
}

cat("2 to the power 10 is", power(2, 10), "\n")
cat("5 to the power 0 is", power(5, 0), "\n")
`, input: "",
    explain: "power(2, 3) becomes 2 × power(2, 2) → 2 × 2 × power(2, 1) → ... → 2 × 2 × 2 × 1. Each call makes e smaller until it hits 0." },
  similar: { text: "Write a recursive function to calculate the factorial of a number.", ex: "s3q3" } },

{ key: "vectors",
  idea: "A vector holds many values of one type; a list holds different types; a matrix is a vector with rows and columns. Most statistics functions take a whole vector at once.",
  steps: ["Create the data: c() for vectors, list() for lists, matrix(data, nrow, ncol) for matrices.",
          "Apply a built-in function to the whole object: mean(), sd(), t(), rowSums() and others.",
          "Print each result with a label using cat() or print()."],
  template: R`marks <- c(56, 78, 91, 64, 70)

cat("Mean:", mean(marks), "\n")
cat("Highest:", max(marks), "at position", which.max(marks), "\n")
cat("Above 65:", marks[marks > 65], "\n")
`,
  input: "",
  expected: "Mean: 71.8\nHighest: 91 at position 3\nAbove 65: 78 91 70",
  mistake: "Writing marks = 56, 78, 91 without c(). In R, you must use c() to join values into a vector.",
  worked: { q: "Make a 3 × 3 matrix of the numbers 1 to 9. Print it, its transpose and its diagonal.",
    code: R`m <- matrix(1:9, nrow = 3, byrow = TRUE)
print(m)

cat("Transpose:\n")
print(t(m))

cat("Diagonal:", diag(m), "\n")
cat("Sum of each row:", rowSums(m), "\n")
`, input: "",
    explain: "byrow = TRUE fills the matrix row by row. t() swaps rows and columns. diag() picks m[1,1], m[2,2] and m[3,3]." },
  similar: { text: "Create a vector of 10 numbers and calculate its mean, median, variance and standard deviation.", ex: "s1q2" } },

{ key: "dataframes",
  idea: "A data frame is a table: each column is a vector. Pick rows with df[condition, ], save with write.csv(), load with read.csv().",
  steps: ["Build the table with data.frame(col1 = c(...), col2 = c(...)) or load it with read.csv().",
          "Select rows with df[df$col > value, ] and sort with df[order(df$col), ].",
          "Show it with print(), head() or summary(), or save it with write.csv(df, \"file.csv\", row.names = FALSE)."],
  template: R`df <- data.frame(name = c("Anu", "Bilal", "Chitra"),
                 marks = c(82, 67, 91))
write.csv(df, "demo.csv", row.names = FALSE)

back <- read.csv("demo.csv")
print(back[back$marks > 70, ])
`,
  input: "",
  expected: "    name marks\n1    Anu    82\n3 Chitra    91",
  mistake: "Forgetting the comma in df[df$marks > 70, ]. Without it, R treats the condition as a column selection and you get an error or the wrong output.",
  worked: { q: "Read class_marks.csv, keep CSBS students and sort them by marks from highest to lowest.",
    code: R`df <- read.csv("class_marks.csv")      # sample file on this site

csbs <- df[df$dept == "CSBS", ]
csbs <- csbs[order(csbs$marks, decreasing = TRUE), ]
print(csbs)

cat("Average marks of CSBS students:", mean(csbs$marks), "\n")
`, input: "",
    explain: "== compares each dept value with \"CSBS\" and gives TRUE/FALSE per row. order() returns row positions in sorted order." },
  similar: { text: "Save a data frame to CSV, read it back, filter it and sort it.", ex: "v1" } },

{ key: "plots",
  idea: "Base R draws a plot with a single call: barplot() for categories, hist() for distributions, boxplot() for spread, plot(x, y) for relationships.",
  steps: ["Prepare the numbers in vectors (and labels for categories).",
          "Call the plot function with the data first.",
          "Add main = title, xlab and ylab so the plot explains itself."],
  template: R`sales <- c(12, 19, 7, 15)
months <- c("Jan", "Feb", "Mar", "Apr")

barplot(sales, names.arg = months, col = "tan",
        main = "Sales per month", xlab = "Month", ylab = "Units")
`,
  input: "",
  expected: "A bar chart with 4 bars labelled Jan to Apr; Feb is the tallest (19).",
  mistake: "Giving names.arg a different length from the data. R stops with \"incorrect number of names\".",
  worked: { q: "Draw a line graph of temperatures over 7 days with points on the line.",
    code: R`temp <- c(31, 33, 32, 35, 34, 30, 29)
day <- 1:7

plot(day, temp, type = "b", pch = 19, col = "firebrick",
     main = "Temperature this week", xlab = "Day", ylab = "Temperature (°C)")
`, input: "",
    explain: "type = \"b\" draws both points and lines. pch = 19 makes solid dots." },
  similar: { text: "Draw a bar plot of marks obtained in five subjects.", ex: "s2q2" } },
];

const EXTENSION = [
{ title: "Matrix multiplication",
  text: "A %*% B works only when ncol(A) equals nrow(B). The answer has nrow(A) rows and ncol(B) columns. A * B is different: it multiplies matching cells and needs equal sizes.",
  code: R`A <- matrix(c(1, 2, 3, 4, 5, 6), nrow = 2)   # 2 x 3
B <- matrix(c(1, 0, 2, 1, 3, 1), nrow = 3)   # 3 x 2

cat("A %*% B (2 x 2):\n")
print(A %*% B)

cat("Element-wise A * A:\n")
print(A * A)
`, practice: "v8" },
{ title: "Histogram and box plot",
  text: "A histogram shows how values are spread across ranges. A box plot shows the minimum, Q1, median, Q3 and maximum, and marks outliers as dots.",
  code: R`marks <- c(45, 52, 58, 61, 63, 66, 68, 70, 71, 73, 75, 76, 78, 80, 82, 85, 88, 90, 94, 98)
par(mfrow = c(1, 2))
hist(marks, col = "lightblue", main = "Histogram")
boxplot(marks, col = "lightgreen", main = "Box plot")
par(mfrow = c(1, 1))
print(fivenum(marks))
`, practice: "v9" },
{ title: "Correlation and covariance",
  text: "cov(x, y) shows the direction of the relationship, but its size depends on the units. cor(x, y) is always between −1 and +1. Near +1 means strongly positive, near 0 means no linear relationship, and near −1 means strongly negative.",
  code: R`hours <- c(2, 3, 5, 1, 4, 6, 7, 3)
score <- c(55, 60, 75, 45, 68, 80, 88, 62)
cat("Covariance:", cov(hours, score), "\n")
cat("Correlation:", cor(hours, score), "\n")
plot(hours, score, pch = 19, main = "Hours vs score")
`, practice: "v10" },
];

const PROB_ROWS = [
  // [distribution, words, R code, value]
  ["Binomial (n = 10, p = 0.5)", "exactly 3",  "dbinom(3, 10, 0.5)",       "0.1171875"],
  ["Binomial (n = 10, p = 0.5)", "at most 3",  "pbinom(3, 10, 0.5)",       "0.171875"],
  ["Binomial (n = 10, p = 0.5)", "at least 3", "1 - pbinom(2, 10, 0.5)",   "0.9453125"],
  ["Poisson (λ = 2)",            "exactly 1",  "dpois(1, 2)",              "0.2706706"],
  ["Poisson (λ = 2)",            "at most 1",  "ppois(1, 2)",              "0.4060058"],
  ["Poisson (λ = 2)",            "at least 1", "1 - ppois(0, 2)",          "0.8646647"],
  ["Normal (mean 60, sd 10)",    "at most 75", "pnorm(75, 60, 10)",        "0.9331928"],
  ["Normal (mean 60, sd 10)",    "at least 50","1 - pnorm(50, 60, 10)",    "0.8413447"],
  ["Normal (mean 60, sd 10)",    "between 50 and 75", "pnorm(75, 60, 10) - pnorm(50, 60, 10)", "0.7745375"],
];

const PROB_CODE = R`# Binomial: 10 coin tosses, p = 0.5
cat("Exactly 3 heads:  ", dbinom(3, size = 10, prob = 0.5), "\n")
cat("At most 3 heads:  ", pbinom(3, size = 10, prob = 0.5), "\n")
cat("At least 3 heads: ", 1 - pbinom(2, size = 10, prob = 0.5), "\n")

# Poisson: on average 2 calls per minute
cat("Exactly 1 call:   ", dpois(1, lambda = 2), "\n")
cat("At most 1 call:   ", ppois(1, lambda = 2), "\n")
cat("At least 1 call:  ", 1 - ppois(0, lambda = 2), "\n")

# Normal: marks with mean 60 and sd 10
cat("At most 75 marks: ", pnorm(75, mean = 60, sd = 10), "\n")
cat("At least 50 marks:", 1 - pnorm(50, mean = 60, sd = 10), "\n")
`;
