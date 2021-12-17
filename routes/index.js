var express = require('express');
var fs = require('fs');
var router = express.Router();
var pgp = require('pg-promise')({ capSQL: true });
const dbCfg = JSON.parse(fs.readFileSync(__dirname + '/../db.json', 'utf8'));
var db = pgp(`postgres://${dbCfg.user}:${dbCfg.password}@${dbCfg.host}:${dbCfg.port}/${dbCfg.db}`);

function getGraphPointsPast(req, res, next) {
  db.any(`WITH past_events AS (
            SELECT DISTINCT ON (date) amount, date
            FROM balance_log
            WHERE date BETWEEN date_trunc('month', current_date):: date - interval '1 months' AND current_date
            ORDER BY date ASC, balance_log_id DESC
          )
          SELECT date_trunc('day', dd)::date::text AS date, amount
          FROM generate_series(
            date_trunc('month', current_date)::date - interval '1 months',
            current_date::date,
            '1 day'::interval
          ) dd
          LEFT JOIN past_events ON date = dd`)
    .then(function (data) {
      req.graphPastPoints = data;
      return next();
    })
    .catch(function (error) {
      console.log('ERROR:', error);
    })
}

function getGraphPointsFuture(req, res, next) {
  db.any(`WITH future_events AS (
            WITH RECURSIVE expense_recurrences(amount, name, date) AS (
              SELECT amount, name, first_occurance
              FROM expense_recurring
              UNION ALL
              SELECT expense_recurring.amount, expense_recurring.name, (expense_recurrences.date + frequency)::date
              FROM expense_recurrences
              INNER JOIN expense_recurring USING(name)
              WHERE date + frequency < date_trunc('month', current_date)::date + interval '3 months'
            ), income_recurrences(amount, name, date) AS (
              SELECT -amount, name, first_occurance
              FROM income_recurring
              UNION ALL
              SELECT -income_recurring.amount, income_recurring.name, (income_recurrences.date + frequency)::date
              FROM income_recurrences
              INNER JOIN income_recurring USING(name)
              WHERE date + frequency < date_trunc('month', current_date)::date + interval '3 months'
            )
            SELECT sum(amount) AS amount, date
            FROM expense_recurrences
            WHERE date >= current_date
            GROUP BY date
            UNION ALL
            SELECT sum(amount) AS amount, date
            FROM expense_delayed
            WHERE date BETWEEN current_date AND date_trunc('month', current_date)::date + interval '3 months'
            GROUP BY date
            UNION ALL
            SELECT sum(amount) AS amount, date
            FROM income_recurrences
            GROUP BY date
            ORDER BY date ASC
          )
          SELECT date_trunc('day', dd)::date::text AS date, sum(amount) AS amount
          FROM generate_series(
            current_date::date, current_date::timestamp + interval '3 months', '1 day'::interval
          ) dd
          LEFT JOIN future_events ON date = dd
          GROUP BY 1`)
    .then(function (data) {
      req.graphFuturePoints = data;
      return next();
    })
    .catch(function (error) {
      console.log('ERROR:', error);
    })
}

function getCategories(req, res, next) {
  db.any(`SELECT category_id AS id, name FROM categories`)
    .then(function (data) {
      req.categories = data;
      return next();
    })
    .catch(function (error) {
      console.log('ERROR:', error);
    })
}

function getExpenseImmediate(req, res, next) {
  db.any(`SELECT expense.name, expense.amount, expense.date::text, categories.name AS category
          FROM expense_immediate expense
          INNER JOIN categories USING(category_id)
          WHERE date >= date_trunc('month', current_date)::date`)
    .then(function (data) {
      req.expenseImmediate = data;
      return next();
    })
    .catch(function (error) {
      console.log('ERROR:', error);
    });
}

function getExpenseImmediateTotal(req, res, next) {
  db.any(`SELECT sum(amount)
          FROM expense_immediate
          WHERE date >= date_trunc('month', current_date)::date`)
    .then(function (data) {
      req.expenseImmediateSum = data;
      return next();
    })
    .catch(function (error) {
      console.log('ERROR:', error);
    });
}

function getExpenseImmediateTotalPrevMonth(req, res, next) {
  db.any(`SELECT sum(amount)
          FROM expense_immediate
          WHERE date BETWEEN date_trunc('month', current_date - interval '1 month')
                             AND date_trunc('month', current_date) - interval '1 day'`)
    .then(function (data) {
      req.expenseImmediateSumPrevMonth = data;
      return next();
    })
    .catch(function (error) {
      console.log('ERROR:', error);
    });
}

function getExpenseDelayed(req, res, next) {
  db.any(`SELECT expense.name, SUM(amount), categories.name AS category,
                 CASE WHEN payments_text = '1/1' THEN '' ELSE payments_text END AS payments_text
          FROM expense_delayed expense
          INNER JOIN categories USING(category_id)
          WHERE date BETWEEN current_date AND current_date + interval '1 month' - interval '1 day'
          GROUP BY expense.name, category,
                   CASE WHEN payments_text = '1/1' THEN '' ELSE payments_text END`)
    .then(function (data) {
      req.expenseDelayed = data;
      return next();
    })
    .catch(function (error) {
      console.log('ERROR:', error);
    });
}

function getExpenseDelayedTotal(req, res, next) {
  db.any(`SELECT sum(amount)
          FROM expense_delayed
          WHERE date = date_trunc('month', current_date) + interval '1 month' + interval '1 day'`)
    .then(function (data) {
      req.expenseDelayedSum = data;
      return next();
    })
    .catch(function (error) {
      console.log('ERROR:', error);
    });
}

function getExpenseDelayedTotalPrevMonth(req, res, next) {
  db.any(`SELECT sum(amount)
          FROM expense_delayed
          WHERE date = date_trunc('month', current_date) + interval '1 day'`)
    .then(function (data) {
      req.expenseDelayedSumPrevMonth = data;
      return next();
    })
    .catch(function (error) {
      console.log('ERROR:', error);
    });
}

function getExpenseRecurring(req, res, next) {
  db.any(`SELECT name, amount FROM expense_recurring`)
    .then(function (data) {
      req.expenseRecurring = data;
      return next();
    })
    .catch(function (error) {
      console.log('ERROR:', error);
    });
}

function getExpenseRecurringTotal(req, res, next) {
  db.any(`SELECT sum(amount) FROM expense_recurring`)
    .then(function (data) {
      req.expenseRecurringSum = data;
      return next();
    })
    .catch(function (error) {
      console.log('ERROR:', error);
    });
}

function getBalance(req, res, next) {
  db.one(`SELECT amount FROM balance_log ORDER BY balance_log_id DESC LIMIT 1`)
    .then(function (data) {
      req.currentBalance = data['amount'];
      return next();
    })
    .catch(function (error) {
      console.log('ERROR:', error);
    });
}

function getIncome(req, res, next) {
  db.one(`SELECT sum(amount) FROM income_recurring`)
    .then(function (data) {
      req.income = data['sum'];
      return next();
    })
    .catch(function (error) {
      console.log('ERROR:', error);
    });
}

function renderExpensePage(req, res) {
  res.status(200).render('index', { expenseRecurring: req.expenseRecurring,
                                    expenseRecurringSum: req.expenseRecurringSum[0],
                                    expenseDelayed: req.expenseDelayed,
                                    expenseDelayedSum: req.expenseDelayedSum[0],
                                    expenseDelayedSumPrevMonth: req.expenseDelayedSumPrevMonth[0],
                                    expenseImmediate: req.expenseImmediate,
                                    expenseImmediateSum: req.expenseImmediateSum[0],
                                    expenseImmediateSumPrevMonth: req.expenseImmediateSumPrevMonth[0],
                                    categories: req.categories,
                                    graphPastPoints: req.graphPastPoints,
                                    graphFuturePoints: req.graphFuturePoints,
                                    currentBalance: req.currentBalance,
                                    income: req.income});
}

function addExpenseImmediate(req, res) {
  try {
    db.none(pgp.helpers.insert(req.body, null, 'expense_immediate'));
    db.none(`UPDATE balance_log
             SET amount = amount - $(value)
             WHERE date > $(date)`,
            { value: req.body.amount, date: req.body.date });
    db.none(`INSERT INTO balance_log(amount, date)
             SELECT amount - $(value), $(date)
             FROM balance_log
             WHERE date <= $(date)
             ORDER BY balance_log_id DESC
             LIMIT 1`,
            {value: req.body.amount, date: req.body.date});
    res.end('{"success" : "Updated Successfully", "status" : 200}');
  } catch(e) {
    console.log(e);
  }
}

function addExpenseDelayed(req, res) {
  try {
    db.none(pgp.helpers.insert(req.body.payloads, req.body.columns, 'expense_delayed'));
    res.end('{"success" : "Updated Successfully", "status" : 200}');
  } catch (e) {
    console.log(e);
  }
}

router.get('/', getCategories, getExpenseRecurring, getExpenseRecurringTotal, getExpenseDelayed,
                getExpenseDelayedTotal, getExpenseDelayedTotalPrevMonth, getExpenseImmediate,
                getExpenseImmediateTotal, getExpenseImmediateTotalPrevMonth,
                getGraphPointsPast, getGraphPointsFuture, getBalance, getIncome, renderExpensePage);

router.post('/expense/immediate', addExpenseImmediate);

router.post('/expense/delayed', addExpenseDelayed);

module.exports = router;
