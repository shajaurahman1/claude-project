// Extra programs for the exam-day guide (statistics "Q4" topics and first-batch questions
// that are not in the study material). Outputs are produced by running these in R.
const R2 = String.raw;
const NEW_PROGRAMS = [
{ id: "n_dfstats", title: "Data frame: mean, median and SD",
  question: "Create a data frame and find the mean, median and standard deviation of a column.",
  algo: ["Start.", "Create a data frame students with name and marks.", "Print the data frame.", "Find mean, median and sd of students$marks.", "Print the three values and the summary.", "Stop."],
  code: R2`students <- data.frame(
  name  = c("Anu", "Bilal", "Chitra", "Devan", "Esha", "Farhan"),
  marks = c(82, 67, 91, 45, 76, 58)
)
print(students)

cat("Mean of marks:  ", mean(students$marks), "\n")
cat("Median of marks:", median(students$marks), "\n")
cat("SD of marks:    ", sd(students$marks), "\n")

cat("\nSummary:\n")
print(summary(students$marks))
`, input: [],
  read: "Use df$column to take one column out of the data frame, then apply mean(), median() and sd() to it." },

{ id: "n_ttest", title: "t-test (one sample and two sample)",
  question: "Perform a t-test in R and state the decision.",
  algo: ["Start.", "Store the sample values in a vector marks.", "One-sample test: t.test(marks, mu = 50). H0: the mean is 50.", "Store two groups in vectors groupA and groupB.", "Two-sample test: t.test(groupA, groupB). H0: the two means are equal.", "For each test: if p-value < 0.05, reject H0; else accept H0.", "Print the results and decisions.", "Stop."],
  code: R2`# One-sample t-test  (H0: population mean = 50)
marks <- c(52, 48, 55, 60, 47, 53, 58, 50)
res1 <- t.test(marks, mu = 50)
print(res1)
if (res1$p.value < 0.05) {
  cat("Decision: p < 0.05, reject H0. Mean is different from 50.\n")
} else {
  cat("Decision: p >= 0.05, accept H0. Mean is not different from 50.\n")
}

# Two-sample t-test  (H0: mean of A = mean of B)
groupA <- c(78, 85, 69, 90, 74, 88, 81)
groupB <- c(65, 72, 70, 68, 60, 75, 66)
res2 <- t.test(groupA, groupB)
print(res2)
if (res2$p.value < 0.05) {
  cat("Decision: p < 0.05, reject H0. The two group means differ.\n")
} else {
  cat("Decision: p >= 0.05, accept H0. No difference between the groups.\n")
}
`, input: [],
  read: "Look at the p-value line. p < 0.05 means reject H0 (there is a real difference). p ≥ 0.05 means accept H0. Also mention t, df and the 95% confidence interval." },

{ id: "n_paired", title: "Paired t-test (before and after)",
  question: "Marks of 6 students before and after coaching are given. Test whether coaching made a difference.",
  algo: ["Start.", "Store the before and after marks in two vectors.", "Run t.test(after, before, paired = TRUE). H0: no change.", "If p-value < 0.05, reject H0 (coaching helped); else accept H0.", "Print the result and decision.", "Stop."],
  code: R2`before <- c(60, 65, 58, 70, 62, 68)
after  <- c(66, 70, 60, 75, 68, 71)

res <- t.test(after, before, paired = TRUE)
print(res)

if (res$p.value < 0.05) {
  cat("Decision: reject H0. Coaching made a significant difference.\n")
} else {
  cat("Decision: accept H0. No significant difference.\n")
}
`, input: [],
  read: "Paired means the same people are measured twice. Use paired = TRUE. The rule is the same: p < 0.05 means reject H0." },

{ id: "n_chisq", title: "Chi-square test of independence",
  question: "Test whether gender and choice (Yes/No) are independent using a chi-square test.",
  algo: ["Start.", "Enter the observed counts as a matrix (a contingency table).", "Give the rows and columns names.", "Run chisq.test(table). H0: the two variables are independent.", "If p-value < 0.05, reject H0 (they are related); else accept H0.", "Print the table, result and decision.", "Stop."],
  code: R2`obs <- matrix(c(30, 20, 15, 35), nrow = 2,
              dimnames = list(Gender = c("Male", "Female"),
                              Choice = c("Yes", "No")))
print(obs)

res <- chisq.test(obs)
print(res)
cat("Expected counts:\n")
print(res$expected)

if (res$p.value < 0.05) {
  cat("Decision: reject H0. Gender and choice are related.\n")
} else {
  cat("Decision: accept H0. Gender and choice are independent.\n")
}
`, input: [],
  read: "X-squared is the test statistic. For a 2×2 table R applies Yates' continuity correction automatically. p < 0.05 means the variables are related." },

{ id: "n_chigof", title: "Chi-square goodness of fit",
  question: "A die is rolled 60 times. Test whether the die is fair.",
  algo: ["Start.", "Store the observed counts of faces 1 to 6.", "Set the expected probabilities to 1/6 each.", "Run chisq.test(observed, p = probs). H0: the die is fair.", "If p-value < 0.05, reject H0; else accept H0.", "Stop."],
  code: R2`observed <- c(8, 12, 9, 11, 10, 10)     # counts of faces 1 to 6
probs <- rep(1/6, 6)

res <- chisq.test(observed, p = probs)
print(res)

if (res$p.value < 0.05) {
  cat("Decision: reject H0. The die is not fair.\n")
} else {
  cat("Decision: accept H0. The die is fair.\n")
}
`, input: [],
  read: "Goodness of fit compares observed counts with expected proportions. The probabilities in p must add up to 1." },

{ id: "n_rnorm", title: "100 normal observations and a histogram",
  question: "Generate 100 observations from a normal distribution and plot the histogram.",
  algo: ["Start.", "Fix the random seed with set.seed() so the result repeats.", "Generate x = rnorm(100, mean = 50, sd = 10).", "Print the sample mean and sd.", "Draw hist(x) with a title, labels and colour.", "Stop."],
  code: R2`set.seed(123)
x <- rnorm(100, mean = 50, sd = 10)

cat("First 10 values:\n")
print(round(x[1:10], 2))
cat("Sample mean:", mean(x), "\n")
cat("Sample SD:  ", sd(x), "\n")

hist(x, main = "Histogram of 100 normal observations",
     xlab = "Value", col = "lightblue", border = "black")
`, input: [],
  read: "rnorm(n, mean, sd) makes random normal values. The sample mean and SD will be close to 50 and 10, not exactly equal. The histogram should look bell shaped." },

{ id: "n_matrix", title: "Matrix addition and multiplication",
  question: "Create two matrices and find their sum and product.",
  algo: ["Start.", "Create matrices A and B (3 × 3).", "Print A and B.", "Addition: C = A + B (same size needed).", "Multiplication: D = A %*% B (ncol(A) must equal nrow(B)).", "Print C and D.", "Stop."],
  code: R2`A <- matrix(c(1, 2, 3, 4, 5, 6, 7, 8, 9), nrow = 3, byrow = TRUE)
B <- matrix(c(9, 8, 7, 6, 5, 4, 3, 2, 1), nrow = 3, byrow = TRUE)
cat("Matrix A:\n"); print(A)
cat("Matrix B:\n"); print(B)

cat("A + B (addition):\n")
print(A + B)

if (ncol(A) == nrow(B)) {
  cat("A %*% B (multiplication):\n")
  print(A %*% B)
} else {
  cat("Multiplication not possible\n")
}
`, input: [],
  read: "A + B adds matching cells. A %*% B is true matrix multiplication. A * B is NOT matrix multiplication; it only multiplies matching cells." },

{ id: "n_corcov", title: "Correlation and covariance",
  question: "Find the covariance and correlation between two variables and interpret them.",
  algo: ["Start.", "Store the two variables x and y in vectors.", "Compute covariance cov(x, y).", "Compute correlation r = cor(x, y).", "If r > 0, positive relation; if r < 0, negative; near 0, no relation.", "Draw a scatter plot of y against x.", "Stop."],
  code: R2`hours <- c(2, 3, 5, 1, 4, 6, 7, 3)
score <- c(55, 60, 75, 45, 68, 80, 88, 62)

cat("Covariance:", cov(hours, score), "\n")
r <- cor(hours, score)
cat("Correlation:", r, "\n")

if (r > 0.7) {
  cat("Strong positive correlation\n")
} else if (r > 0) {
  cat("Weak positive correlation\n")
} else if (r < -0.7) {
  cat("Strong negative correlation\n")
} else {
  cat("Weak negative or no correlation\n")
}

plot(hours, score, pch = 19, col = "blue",
     main = "Hours vs Score", xlab = "Study hours", ylab = "Score")
`, input: [],
  read: "Correlation is always between −1 and +1. Covariance has units and only its sign matters. You can also run cor.test(hours, score) to get a p-value." },

{ id: "n_fibseries", title: "Fibonacci series up to n terms using recursion",
  question: "Print the Fibonacci series up to n terms using a recursive function.",
  algo: ["Start.", "Define fib(n): if n ≤ 1 return n; else return fib(n − 1) + fib(n − 2).", "Read the number of terms n.", "For i = 0 to n − 1: print fib(i).", "Stop."],
  code: R2`fib <- function(n) {
  if (n <= 1) return(n)
  return(fib(n - 1) + fib(n - 2))
}

n <- as.integer(readline("How many terms? "))
cat("Fibonacci series:\n")
for (i in 0:(n - 1)) {
  cat(fib(i), "")
}
cat("\n")
`, input: ["10"],
  read: "The recursion finds one term. The loop calls it for each position to print the whole series." },

{ id: "n_anova", title: "One-way ANOVA",
  question: "Scores of students taught by three methods are given. Test whether the method affects the score.",
  algo: ["Start.", "Store the scores and the method for each student in a data frame.", "Run aov(score ~ method) and print summary(). H0: all group means are equal.", "Read the p-value Pr(>F).", "If p < 0.05, reject H0 (the method matters); else accept H0.", "Stop."],
  code: R2`score  <- c(70, 72, 68, 75, 80, 82, 78, 85, 60, 65, 62, 58)
method <- factor(rep(c("A", "B", "C"), each = 4))
df <- data.frame(score, method)

model <- aov(score ~ method, data = df)
print(summary(model))

p <- summary(model)[[1]][["Pr(>F)"]][1]
if (p < 0.05) {
  cat("Decision: reject H0. Teaching method affects the score.\n")
} else {
  cat("Decision: accept H0. No effect of teaching method.\n")
}
`, input: [],
  read: "ANOVA compares 3 or more group means. Use it instead of many t-tests. Read the Pr(>F) column for the p-value." },

{ id: "n_regression", title: "Simple linear regression",
  question: "Fit a regression line of score on study hours and predict the score for 8 hours.",
  algo: ["Start.", "Store x (hours) and y (score).", "Fit the model with lm(y ~ x).", "Print the intercept and slope from coef(model).", "Predict y for a new x with predict().", "Plot the points and draw the line with abline(model).", "Stop."],
  code: R2`hours <- c(2, 3, 5, 1, 4, 6, 7, 3)
score <- c(55, 60, 75, 45, 68, 80, 88, 62)

model <- lm(score ~ hours)
print(coef(model))
cat("Equation: score =", round(coef(model)[1], 2), "+",
    round(coef(model)[2], 2), "* hours\n")

new <- data.frame(hours = 8)
cat("Predicted score for 8 hours:", predict(model, new), "\n")

plot(hours, score, pch = 19, main = "Regression line",
     xlab = "Hours", ylab = "Score")
abline(model, col = "red", lwd = 2)
`, input: [],
  read: "y = a + b·x. a is the intercept and b is the slope (how much y changes when x goes up by 1). summary(model) also gives R-squared." },

{ id: "n_timeseries", title: "Time series",
  question: "Create a time series of monthly sales and plot it. Also plot the built-in AirPassengers data.",
  algo: ["Start.", "Store 12 monthly sales values in a vector.", "Convert it with ts(sales, start = c(2024, 1), frequency = 12).", "Print the series and plot it.", "Load AirPassengers, print start, end and frequency, and plot it.", "Stop."],
  code: R2`sales <- c(120, 135, 150, 145, 160, 175, 190, 185, 170, 165, 180, 200)
sales_ts <- ts(sales, start = c(2024, 1), frequency = 12)
print(sales_ts)

data(AirPassengers)
cat("AirPassengers starts:", start(AirPassengers),
    " ends:", end(AirPassengers),
    " frequency:", frequency(AirPassengers), "\n")

par(mfrow = c(1, 2))
plot(sales_ts, main = "Monthly sales 2024", ylab = "Sales", col = "blue")
plot(AirPassengers, main = "AirPassengers 1949-1960", ylab = "Passengers")
par(mfrow = c(1, 1))
`, input: [],
  read: "frequency = 12 means monthly, 4 means quarterly, 1 means yearly. Built-in time series datasets: AirPassengers, Nile, co2, nottem, UKgas." },

{ id: "n_randdist", title: "Random binomial and Poisson values",
  question: "Generate random values from binomial and Poisson distributions and show their frequency.",
  algo: ["Start.", "Set the seed.", "Generate b = rbinom(20, size = 10, prob = 0.5).", "Generate p = rpois(20, lambda = 3).", "Print both and their frequency tables.", "Draw a bar plot of the binomial frequencies.", "Stop."],
  code: R2`set.seed(1)
b <- rbinom(20, size = 10, prob = 0.5)
p <- rpois(20, lambda = 3)

cat("Binomial values:\n"); print(b)
cat("Poisson values:\n");  print(p)
cat("Binomial frequency table:\n"); print(table(b))

barplot(table(b), main = "Binomial(10, 0.5) frequencies",
        xlab = "Number of successes", col = "orange")
`, input: [],
  read: "r = random values, d = exact probability, p = cumulative (at most), q = quantile. Example: rnorm, dnorm, pnorm, qnorm." },
];
