# finance-tracker
I use this project to keep track of my spendings. It's very tailored to my specific needs, but if you feel like adopting it for yourself, here's a short explanation of what I did here...

![demonstration](https://user-images.githubusercontent.com/9519048/182495054-16446e0a-cb10-4a38-9be2-0e72dd939192.jpg)

## Expenses
Expenses are divided into 3 categories:
- Constant recurring expenses like rent, loan payments, etc. Affect the balance on the first of the month.
- Variable immediate expenses are ones that apply on the spot (mainly online purchases), so they affect the balance immediately.
- Variable delayed expenses. In other words, everything paid using a credit card. Affect the balance on the 2nd of each month.

Variable expenses are organized into categores, which can later be used for expense analysis.

Variable expenses display the sum of expenses at the top of the table, and the sum of the previous month expenses in parenthesis for comparison.

## Income
Income is currently not displayed by the app, since it's not complicated like the expenses. However, it is taken into consideration in the graph, and in the daily budget data points.

## Daily budget
The daily budget that is displayed at the top of the page is basically `(income - all_expenses) / days_left_in_month`. It's the maximum amount I can spend each remaining day of the month without spending more than this month's income.
